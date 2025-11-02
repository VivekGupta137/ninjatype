import { Group } from '@visx/group';
import { getPoint, LinePath, AreaClosed } from '@visx/shape';
import { scaleLinear, scaleTime } from '@visx/scale';
import { curveMonotoneX } from '@visx/curve';
import { ParentSize } from '@visx/responsive';
import { useStore } from '@nanostores/react';
import { $rawCPS, $errorCPS, $correctCPS } from '@/store/analytics';
import { AxisRight } from '@visx/axis';
import { Text } from '@visx/text';
import { MarkerArrow, MarkerCross, MarkerX, MarkerCircle, MarkerLine } from '@visx/marker';
import { Tooltip, useTooltip } from '@visx/tooltip';
import { localPoint } from '@visx/event';

// Type definition for time-based WPM data
type WPMData = {
    time: number;
    wpm: number;
    burstWpm?: number;
    errorCount?: number;
    correctWpm?: number;
};

// Accessor functions
const getTime = (d: WPMData): number => d.time;
const getRawWPM = (d: WPMData): number => d.wpm;
const getBurstWPM = (d: WPMData): number => d.burstWpm ?? 0;
const getErrorCount = (d: WPMData): number => d.errorCount ?? 0;
const getCorrectWPM = (d: WPMData): number => d.correctWpm ?? 0;

const margin = { top: 20, bottom: 30, left: 40, right: 60 };

// Colors
const colors = {
    primary: 'var(--main-color)',
    secondary: 'var(--sub-text-color)',
    tertiary: 'var(--sub-alt-text-color)',
    error: 'var(--error-color)',
    grid: 'rgba(0, 0, 0, 0.05)',
    crosshair: 'rgba(0, 0, 0, 0.15)',
    axis: 'var(--sub-text-color)',
    background: 'transparent',
};

type ChartProps = {
    width: number;
    height: number;
    rawWpm: WPMData[];
};

type TooltipData = {
    rawWpm: number;
    burstWpm?: number;
    errorCount?: number;
    correctWpm?: number;
    time: number;
};

const Chart: React.FC<ChartProps> = ({ width, height, rawWpm }) => {
    // Calculate bounds
    const xMax = width - margin.left - margin.right;
    const yMax = height - margin.top - margin.bottom;

    const { tooltipData,
        tooltipLeft,
        tooltipTop,
        tooltipOpen,
        showTooltip,
        hideTooltip
    } = useTooltip<TooltipData>()

    // If no data, return empty chart
    if (rawWpm.length === 0) {
        return (
            <svg width={width} height={height}>
                <rect width={width} height={height} fill={colors.background} />
            </svg>
        );
    }



    // Create scales
    const xScale = scaleLinear({
        range: [0, xMax],
        domain: [Math.min(...rawWpm.map(d => getTime(d))), Math.max(...rawWpm.map(d => getTime(d)))],
    });
    const yScale = scaleLinear({
        range: [yMax, 0],
        round: true,
        domain: [0, Math.max(...rawWpm.map(getRawWPM), ...rawWpm.map(getBurstWPM), ...rawWpm.map(getCorrectWPM)) * 1.1],
    });


    const handleMouseMove = (event: React.MouseEvent<SVGElement>) => {
        const point = localPoint(event);
        if (!point) return;

        // Adjust for margin
        const relativeX = point.x - margin.left;
        const relativeY = point.y - margin.top;

        // Check if mouse is within chart bounds
        if (relativeX < 0 || relativeX > xMax || relativeY < 0 || relativeY > yMax) {
            hideTooltip();
            return;
        }

        // Find the time value at mouse position
        const timeAtMouse = xScale.invert(relativeX);

        // Find closest data point
        const closestPoint = rawWpm.reduce((prev, curr) => {
            const prevDiff = Math.abs(getTime(prev) - timeAtMouse);
            const currDiff = Math.abs(getTime(curr) - timeAtMouse);
            return currDiff < prevDiff ? curr : prev;
        });

        if (closestPoint) {
            const x = xScale(getTime(closestPoint)) ?? 0;
            const y = yScale(getBurstWPM(closestPoint)) ?? 0;
            
            showTooltip({
                tooltipLeft: x + margin.left,
                tooltipTop: y,
                tooltipData: {
                    time: closestPoint.time,
                    rawWpm: closestPoint.wpm,
                    burstWpm: closestPoint.burstWpm,
                    errorCount: closestPoint.errorCount,
                    correctWpm: closestPoint.correctWpm,
                }
            });
        }
    }

    return (
        <div style={{position: "relative"}}>
            <svg width={width} height={height} onMouseMove={handleMouseMove} onMouseLeave={hideTooltip}>
                <defs>
                    <linearGradient id="area-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor={colors.primary} stopOpacity={0.4} />
                        <stop offset="100%" stopColor={colors.primary} stopOpacity={0} />
                    </linearGradient>
                </defs>
                <rect width={width} height={height} fill={colors.background} />
                <MarkerX
                    id="marker-x"
                    stroke="red"
                    size={22}
                    strokeWidth={4}
                    markerUnits="userSpaceOnUse"
                // strokeOpacity={0.6}
                />
                <MarkerArrow id="marker-arrow" fill="red" refX={2} size={6} opacity={0.6} />

                <Group top={margin.top} left={margin.left}>
                    {/* Correct WPM area chart (filled) */}
                    <AreaClosed
                        data={rawWpm}
                        x={(d) => xScale(getTime(d)) ?? 0}
                        y={(d) => yScale(getCorrectWPM(d)) ?? 0}
                        yScale={yScale}
                        fill="url(#area-gradient)"
                        curve={curveMonotoneX}
                    />
                    <LinePath
                        data={rawWpm}
                        x={(d) => xScale(getTime(d)) ?? 0}
                        y={(d) => yScale(getCorrectWPM(d)) ?? 0}
                        stroke={colors.primary}
                        strokeWidth={2}
                        curve={curveMonotoneX}
                        shapeRendering="geometricPrecision"
                    />
                    
                    {/* Raw WPM line (solid) */}
                    <LinePath
                        data={rawWpm}
                        x={(d) => xScale(getTime(d)) ?? 0}
                        y={(d) => yScale(getRawWPM(d)) ?? 0}
                        stroke={colors.tertiary}
                        strokeWidth={2}
                        curve={curveMonotoneX}
                        shapeRendering="geometricPrecision"
                    />
                    {/* Burst WPM line (dashed) */}
                    <LinePath
                        data={rawWpm}
                        x={(d) => xScale(getTime(d)) ?? 0}
                        y={(d) => yScale(getBurstWPM(d)) ?? 0}
                        stroke={colors.secondary}
                        strokeWidth={2}
                        strokeDasharray="5,5"
                        curve={curveMonotoneX}
                    />
                    {/* Error markers - show X where errors occurred */}
                    {rawWpm.filter(d => getErrorCount(d) > 0).map((d, i) => {
                        const x = xScale(getTime(d)) ?? 0;
                        const y = yScale(getBurstWPM(d)) ?? 0;
                        return (
                            <text
                                key={`error-${i}`}
                                x={x}
                                y={y}
                                textAnchor="middle"
                                dominantBaseline="central"
                                fontSize={16}
                                fontWeight="bold"
                                fill={colors.error}
                                style={{ pointerEvents: 'none' }}
                            >
                                ✕
                            </text>
                        );
                    })}
                    {/* Right Y-axis */}
                    <AxisRight
                        left={xMax}
                        scale={yScale}
                        numTicks={5}
                        tickLabelProps={() => ({
                            fill: colors.axis,
                            fontSize: 10,
                            textAnchor: 'start',
                            dx: '0.5em',
                            dy: '0.3em',
                        })}
                        label='WPM'
                        labelOffset={30}
                        labelProps={{
                            fill: colors.axis,
                            fontSize: 12,
                            fontWeight: '600',
                            textAnchor: 'middle',
                        }}
                        hideAxisLine
                        hideTicks
                    />

                </Group>
            </svg>
            {tooltipOpen && tooltipData && (
                <Tooltip
                    top={tooltipTop}
                    left={tooltipLeft}
                    style={{
                        position: 'absolute',
                        backgroundColor: 'var(--bg-color)',
                        backdropFilter: 'blur(8px)',
                        border: `1px solid ${colors.tertiary}`,
                        borderRadius: '8px',
                        padding: '12px 16px',
                        fontSize: '13px',
                        color: 'var(--text-color)',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
                        minWidth: '140px',
                    }}
                >
                    <div style={{ marginBottom: '8px', paddingBottom: '8px', borderBottom: `1px solid ${colors.tertiary}` }}>
                        <div style={{ fontSize: '11px', color: 'var(--text-color)', marginBottom: '2px' , fontWeight: '600'}}>WPM</div>
                        {/* <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-color)' }}>{tooltipData.time}s</div> */}
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ width: '8px', height: '8px', backgroundColor: colors.tertiary, borderRadius: '50%', display: 'inline-block' }}></span>
                                <span style={{ color: colors.secondary }}>Raw</span>
                            </div>
                            <span style={{ fontWeight: '600', color: 'var(--text-color)' }}>{tooltipData.rawWpm}</span>
                        </div>
                        
                        {tooltipData.burstWpm !== undefined && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ width: '8px', height: '2px', backgroundColor: colors.secondary, display: 'inline-block' }}></span>
                                    <span style={{ color: colors.secondary }}>Burst</span>
                                </div>
                                <span style={{ fontWeight: '600', color: 'var(--text-color)' }}>{tooltipData.burstWpm}</span>
                            </div>
                        )}
                        
                        {tooltipData.correctWpm !== undefined && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ width: '8px', height: '8px', backgroundColor: colors.primary, borderRadius: '50%', display: 'inline-block' }}></span>
                                    <span style={{ color: colors.secondary }}>Actual</span>
                                </div>
                                <span style={{ fontWeight: '600', color: 'var(--text-color)' }}>{tooltipData.correctWpm}</span>
                            </div>
                        )}
                        
                        {tooltipData.errorCount !== undefined && tooltipData.errorCount > 0 && (
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                marginTop: '4px',
                                paddingTop: '8px',
                                borderTop: `1px solid ${colors.tertiary}`
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ fontSize: '12px', color: colors.error }}>✕</span>
                                    <span style={{ color: colors.error }}>Errors</span>
                                </div>
                                <span style={{ fontWeight: '600', color: colors.error }}>{tooltipData.errorCount}</span>
                            </div>
                        )}
                    </div>
                </Tooltip>
            )}
        </div>
    );
};

const WPSLineChart: React.FC = () => {
    const rawCPS = useStore($rawCPS);
    const errorCPS = useStore($errorCPS);
    const correctCPS = useStore($correctCPS);

    // Convert rawCPS data to WPM data (divide by 4 for words, multiply by 60 for minutes)
    let rawWpm: WPMData[] = rawCPS.map((sample, index) => {
        // wpm = average WPM from the start (cumulative)
        const wpm = (sample.count / (((sample.time || 1) * 5))) * 60;

        const correctWpm = (correctCPS[index].count / (((sample.time || 1) * 5))) * 60;

        // burstWpm = instantaneous WPM based on rate of change between samples
        let burstWpm = 0;
        if (index > 0) {
            const prevSample = rawCPS[index - 1];
            const charsDiff = sample.count - prevSample.count;
            const timeDiff = sample.time - prevSample.time; // it's always = 1
            // Instantaneous speed - should be higher/more variable
            burstWpm = timeDiff > 0 ? (charsDiff / (timeDiff * 5)) * 60 : 0;
        } else if (sample.time > 0) {
            // For first sample, burst equals average
            burstWpm = (sample.count * 60 / ((sample.time * 5) || 1));
        }

        // Find matching error count for this time
        const currentErrorCount = errorCPS[index].count;
        const previousErrorCount = index > 0 ? errorCPS[index - 1].count : 0;
        const errorCount = currentErrorCount - previousErrorCount;

        return {
            time: sample.time, // Keep time in seconds
            wpm: Math.ceil(wpm),
            burstWpm: Math.max(Math.ceil(burstWpm), 0),
            errorCount: errorCount,
            correctWpm: Math.ceil(correctWpm),
        };
    });

    // Group time buckets if data is large (more than 30 points)
    if (rawWpm.length > 30) {
        const bucketSize = Math.ceil(rawWpm.length / 30); // Reduce to ~30 points
        const groupedData: WPMData[] = [];
        
        for (let i = 0; i < rawWpm.length; i += bucketSize) {
            const bucket = rawWpm.slice(i, i + bucketSize);
            
            // Average the values in the bucket
            const avgWpm = Math.ceil(bucket.reduce((sum, d) => sum + d.wpm, 0) / bucket.length);
            const avgBurstWpm = Math.ceil(bucket.reduce((sum, d) => sum + (d.burstWpm ?? 0), 0) / bucket.length);
            const avgCorrectWpm = Math.ceil(bucket.reduce((sum, d) => sum + (d.correctWpm ?? 0), 0) / bucket.length);
            const totalErrors = bucket.reduce((sum, d) => sum + (d.errorCount ?? 0), 0);
            
            // Use the last time point in the bucket
            const time = bucket[bucket.length - 1].time;
            
            groupedData.push({
                time,
                wpm: avgWpm,
                burstWpm: avgBurstWpm,
                correctWpm: avgCorrectWpm,
                errorCount: totalErrors,
            });
        }
        
        rawWpm = groupedData;
    }


    return (
        <div style={{
            width: '100%',
            height: '200px',
            minWidth: '300px',
            maxWidth: '800px',
            position: 'relative',
        }}>
            <ParentSize>
                {({ width, height }) => <Chart width={width} height={height} rawWpm={rawWpm} />}
            </ParentSize>

        </div>
    );
};

export default WPSLineChart;