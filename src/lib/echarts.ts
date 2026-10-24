import * as echarts from "echarts/core";
import { LineChart, ScatterChart } from "echarts/charts";
import {
    AxisPointerComponent,
    GridComponent,
    LegendComponent,
    TooltipComponent,
} from "echarts/components";
import { SVGRenderer } from "echarts/renderers";
import type { LineSeriesOption, ScatterSeriesOption } from "echarts/charts";
import type {
    AxisPointerComponentOption,
    GridComponentOption,
    LegendComponentOption,
    TooltipComponentOption,
} from "echarts/components";
import type { ComposeOption } from "echarts/core";

echarts.use([
    LineChart,
    ScatterChart,
    GridComponent,
    TooltipComponent,
    LegendComponent,
    AxisPointerComponent,
    SVGRenderer,
]);

export type ECOption = ComposeOption<
    | LineSeriesOption
    | ScatterSeriesOption
    | GridComponentOption
    | TooltipComponentOption
    | LegendComponentOption
    | AxisPointerComponentOption
>;

export { echarts };
