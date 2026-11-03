"""Render a 30-second NinjaType Short from actual product screenshots.

Requires Pillow, FFmpeg and the macOS Avenir Next font. No stock assets.
Run with: python build_short.py
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageOps
import math, random, wave, array, subprocess, shutil, json

OUT = Path(__file__).resolve().parent
RAW = OUT.parent / 'promotion' / 'raw'
W, H, FPS, DURATION = 1080, 1920, 30, 30
FONT = '/System/Library/Fonts/Avenir Next.ttc'
WHITE, MUTED = '#f5f7fa', '#a5adbb'
GREEN, BLUE, PURPLE, GOLD, PINK = '#b7e4c7', '#88c0d0', '#cba6f7', '#fbbf24', '#ff79c6'

def font(size, bold=False):
    return ImageFont.truetype(FONT, size, index=0 if bold else 7)

def rgb(value):
    return tuple(int(value[i:i+2], 16) for i in (1,3,5))

def ease(t):
    t = min(1, max(0, t))
    return 1 - (1-t)**3

def background(accent):
    im = Image.new('RGB', (W,H), '#090c12')
    d = ImageDraw.Draw(im)
    for y in range(H):
        k = 1-y/H
        d.line((0,y,W,y), fill=(int(9+4*k),int(12+5*k),int(18+7*k)))
    glow = Image.new('RGBA', (270,480))
    gd = ImageDraw.Draw(glow)
    gd.ellipse((70,-80,390,230), fill=(*rgb(accent),28))
    glow = glow.filter(ImageFilter.GaussianBlur(55)).resize((W,H))
    im.paste(glow,(0,0),glow)
    return im

def cropped(filename, box):
    im = Image.open(RAW/filename).convert('RGB')
    return im.crop(tuple(round(v*(im.width if i%2==0 else im.height)) for i,v in enumerate(box)))

def card(im, shot, box, label, accent, progress, detail=False):
    x,y,w,h = box
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((x-8,y+10,x+w+8,y+h+20),28,fill='#05070a')
    tile = Image.new('RGB',(w,h),'#080a0e')
    td=ImageDraw.Draw(tile)
    td.rectangle((0,0,w,56),fill='#171b23')
    for i in range(3):td.ellipse((20+i*18,23,27+i*18,30),fill='#586170')
    td.text((92,13),label,font=font(19),fill='#c5ccd6')
    # Slow camera movement through a genuine screenshot, with no UI recoloring.
    fitted = (ImageOps.fit(shot,(w,h-56),Image.Resampling.LANCZOS,
                           centering=(.46+.06*progress,.5)) if detail
              else ImageOps.contain(shot,(w-24,h-80),Image.Resampling.LANCZOS))
    scale=1+.025*progress
    fitted=fitted.resize((round(fitted.width*scale),round(fitted.height*scale)),Image.Resampling.BICUBIC)
    tile.paste(fitted,((w-fitted.width)//2,56+(h-56-fitted.height)//2))
    mask=Image.new('L',(w,h));ImageDraw.Draw(mask).rounded_rectangle((0,0,w-1,h-1),24,fill=255)
    im.paste(tile,(x,y),mask)
    ImageDraw.Draw(im).rounded_rectangle((x,y,x+w-1,y+h-1),24,outline='#303745',width=2)

SCENES = [
    dict(start=0,end=3,kind='intro',accent=GREEN,label='A LITTLE PRACTICE. A BETTER RHYTHM.',title=['Find your','typing flow.'],sub='Meet NinjaType.'),
    dict(start=3,end=8,kind='practice',accent=GREEN,label='01 / TYPING PRACTICE',title=['Start small.','Find your pace.'],sub='Timed tests. Clear accuracy feedback.',raw='16-practice-active.png',crop=(.08,.35,.78,.75),chip='25s  /  45s  /  1m  /  2m  /  5m'),
    dict(start=8,end=12,kind='learn',accent=BLUE,label='02 / TOUCH TYPING',title=['Learn the keys.','Build your rhythm.'],sub='Focused lessons for every finger.',raw='17-finger-lesson.png',crop=(.165,.165,.835,.895),chip='Index  /  Middle  /  Ring  /  Pinky'),
    dict(start=12,end=17,kind='race',accent=PURPLE,label='03 / TYPING RACE',title=['Make practice','a race.'],sub='Quick rounds. Rooms with friends.',raw='20-race-active.png',crop=(.175,.145,.825,.705),chip='Words or Time. Your choice.'),
    dict(start=17,end=21,kind='ghost',accent=GOLD,label='04 / GHOST RACE',title=['Chase your','personal best.'],sub='Follow the shadow of your saved pace.',raw='18-ghost-active.png',crop=(.17,.11,.835,.73),chip='Your pace. A fresh challenge.'),
    dict(start=21,end=26,kind='themes',accent=PINK,label='05 / MAKE IT YOURS',title=['Your practice.','Your atmosphere.'],sub='Find a theme that feels like you.'),
    dict(start=26,end=30,kind='outro',accent=GREEN,label='READY WHEN YOU ARE',title=['Your next','session starts here.'],sub='Practice. Learn. Race.'),
]

for s in SCENES:
    s['bg']=background(s['accent'])
    if 'raw' in s:s['shot']=cropped(s['raw'],s['crop'])
THEMES=[('AMOLED',GREEN,'01-practice-amoled.png'),('NORD',BLUE,'09-practice-nord.png'),('DRACULA',PINK,'12-practice-dracula.png')]
THEME_SHOTS=[(name,color,cropped(raw,(.12,.37,.77,.69))) for name,color,raw in THEMES]

def keys(im,t,accent,y=800):
    d=ImageDraw.Draw(im)
    for row, letters in enumerate(['QWERTYUIOP','ASDFGHJKL','ZXCVBNM']):
        kw,gap=76,12;left=(W-(len(letters)*(kw+gap)-gap))//2
        for col,ch in enumerate(letters):
            x=left+col*(kw+gap); yy=y+row*110
            lit=(int(t*8) % 26)==('QWERTYUIOPASDFGHJKLZXCVBNM'.index(ch))
            if lit:yy+=6
            d.rounded_rectangle((x,yy+8,x+kw,yy+90),13,fill='#05070b')
            d.rounded_rectangle((x,yy,x+kw,yy+80),13,fill=accent if lit else '#171d27',outline=accent if lit else '#343c49',width=2)
            d.text((x+kw/2,yy+37),ch,font=font(29,True),fill='#10151c' if lit else '#bec7d4',anchor='mm')
    d.rounded_rectangle((330,y+345,750,y+425),15,fill='#171d27',outline='#343c49',width=2)
    d.text((540,y+383),'space',font=font(25),fill=MUTED,anchor='mm')

def render_scene(s,local):
    p=min(1,max(0,local/(s['end']-s['start'])))
    im=s['bg'].copy();d=ImageDraw.Draw(im)
    a=s['accent']
    d.text((82,160),'NinjaType',font=font(37,True),fill=WHITE)
    d.rounded_rectangle((830,171,978,207),18,fill='#1b222c')
    d.text((904,189),'TYPE. FLOW.',font=font(15,True),fill=a,anchor='mm')
    # Text has a quick, restrained upward entrance.
    layer=Image.new('RGBA',(W,H));ld=ImageDraw.Draw(layer)
    dy=round(25*(1-ease(local/.45)))
    ld.text((82,298+dy),s['label'],font=font(23,True),fill=a)
    size=76 if s['kind']=='outro' else 82
    for i,line in enumerate(s['title']):
        ld.text((76,350+i*108+dy),line,font=font(size,True),fill=a if i==1 else WHITE)
    ld.text((82,597+dy),s['sub'],font=font(29),fill=MUTED)
    alpha=ease(local/.3)
    if alpha<1:layer.putalpha(layer.getchannel('A').point(lambda v:round(v*alpha)))
    im.paste(layer,(0,0),layer)
    if s['kind'] in ['intro','outro']:
        keys(im,local,a,790 if s['kind']=='intro' else 765)
        d=ImageDraw.Draw(im)
        if s['kind']=='intro':
            d.text((540,1330),'A calmer way to practise.',font=font(34),fill=MUTED,anchor='mm')
            d.text((540,1410),'One session at a time.',font=font(28),fill='#687384',anchor='mm')
        else:
            d.rounded_rectangle((82,1250,978,1385),27,fill=a,outline=(*rgb(a),),width=2)
            d.text((530,1317),'ninjatype.com',font=font(57,True),fill='#11191a',anchor='mm')
            d.line((900,1317,942,1317),fill='#11191a',width=4)
            d.line((928,1303,942,1317,928,1331),fill='#11191a',width=4)
            d.text((540,1455),'Open your browser. Start typing.',font=font(29),fill=MUTED,anchor='mm')
    elif s['kind']=='themes':
        for i,(name,col,shot) in enumerate(THEME_SHOTS):
            yy=710+i*245
            ImageDraw.Draw(im).text((88,yy-35),name,font=font(19,True),fill=col)
            card(im,shot,(82,yy,896,192),'ninjatype.com',col,p,detail=True)
        ImageDraw.Draw(im).text((82,1500),'AMOLED. Nord. Dracula. And more.',font=font(27),fill=MUTED)
    else:
        h=655 if s['kind']=='practice' else 735
        card(im,s['shot'],(82,714,896,h),'ninjatype.com',a,p,detail=s['kind']=='practice')
        d=ImageDraw.Draw(im)
        d.rounded_rectangle((82,1490,978,1574),18,fill='#171d27',outline='#303745',width=1)
        d.text((530,1531),s['chip'],font=font(28,True),fill=a,anchor='mm')
    d=ImageDraw.Draw(im)
    if s['kind']!='outro':d.text((82,1673),'ninjatype.com',font=font(29,True),fill=WHITE)
    d.text((978,1685),'PRACTICE / LEARN / RACE',font=font(17),fill='#788493',anchor='ra')
    # A quiet progress rail ties all seven shots together.
    x=82;yy=1760
    for i,scene in enumerate(SCENES):
        ww=round(896*(scene['end']-scene['start'])/30)-7
        d.rounded_rectangle((x,yy,x+ww,yy+4),2,fill='#2b3441')
        if scene['start']<=s['start']:
            fill=ww if scene['start']<s['start'] else round(ww*p)
            if fill>0:d.rounded_rectangle((x,yy,x+fill,yy+4),2,fill=a)
        x+=ww+7
    return im

def frame(t):
    idx=next(i for i,s in enumerate(SCENES) if s['start']<=t<s['end'])
    s=SCENES[idx];local=t-s['start'];im=render_scene(s,local)
    if idx and local<.28:
        prev=SCENES[idx-1]
        im=Image.blend(render_scene(prev,prev['end']-prev['start']),im,ease(local/.28))
    return im

def soundtrack():
    """Original soft synth score; deterministic notes and percussion, no samples."""
    sr=48000;n=sr*DURATION;left=[0.0]*n;right=[0.0]*n
    chords=[(50,57,60,65),(46,53,58,62),(48,55,60,64),(45,52,57,60)]
    for j in range(8):
        start=j*4;length=min(4.8,DURATION-start)
        if length<=0:continue
        for k,note in enumerate(chords[j%4]):
            freq=440*2**((note-69)/12)
            for i in range(int(length*sr)):
                t=i/sr;idx=round(start*sr)+i
                if idx>=n:break
                env=min(1,t/.65)*min(1,max(0,(length-t)/1.1))
                value=.018*env*(math.sin(2*math.pi*freq*t)+.22*math.sin(2*math.pi*freq*2*t))
                left[idx]+=value*(.7 if k%2 else 1)
                right[idx]+=value*(1 if k%2 else .7)
    rng=random.Random(137);beat=60/112
    for b in range(int(DURATION/beat)):
        start=round(b*beat*sr)
        # A soft bass pulse and a very quiet key-like percussive tick.
        for i in range(int(.16*sr)):
            if start+i>=n:break
            t=i/sr
            value=.045*math.sin(2*math.pi*(55*t+2*(1-math.exp(-t*30))))*math.exp(-t*32)
            if i<900:value+=rng.uniform(-1,1)*.012*math.exp(-t*230)
            left[start+i]+=value;right[start+i]+=value
    samples=array.array('h')
    for i in range(n):
        fade=min(1,i/(sr*.6),(n-1-i)/(sr*1.2))
        samples.extend((round(max(-1,min(1,left[i]))*fade*32767),round(max(-1,min(1,right[i]))*fade*32767)))
    with wave.open(str(OUT/'original-soundtrack.wav'),'wb') as wf:
        wf.setnchannels(2);wf.setsampwidth(2);wf.setframerate(sr);wf.writeframes(samples.tobytes())

def main():
    OUT.mkdir(exist_ok=True)
    preview=Image.new('RGB',(1080,960),'#090c12')
    for i,t in enumerate([1.5,5,10,14.5,19,23.5,28]):
        im=frame(t)
        im.save(OUT/f'preview-{i+1:02d}.jpg',quality=93)
        preview.paste(im.resize((216,384)),((i%5)*216,(i//5)*480))
        ImageDraw.Draw(preview).text(((i%5)*216+12,(i//5)*480+400),f'{t:g}s',font=font(23),fill=WHITE)
    preview.save(OUT/'storyboard.jpg',quality=95)
    frame(1.5).save(OUT/'thumbnail.jpg',quality=97)
    print('Storyboard ready',flush=True)
    soundtrack();print('Original soundtrack ready',flush=True)
    ffmpeg=shutil.which('ffmpeg')
    if not ffmpeg:raise RuntimeError('FFmpeg is required for the final render')
    cmd=[ffmpeg,'-y','-loglevel','warning','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','pipe:0','-i',str(OUT/'original-soundtrack.wav'),'-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-af','loudnorm=I=-18:TP=-2:LRA=7','-t','30','-movflags','+faststart',str(OUT/'ninjatype-youtube-short.mp4')]
    with (OUT/'render.log').open('w') as log:
        process=subprocess.Popen(cmd,stdin=subprocess.PIPE,stderr=log)
        for i in range(FPS*DURATION):
            process.stdin.write(frame(i/FPS).tobytes())
            if i%150==0:print(f'Rendered {i/FPS:.0f}s / 30s',flush=True)
        process.stdin.close()
        if process.wait():raise RuntimeError('FFmpeg render failed; see render.log')
    subprocess.run([ffmpeg,'-y','-loglevel','error','-i',str(OUT/'ninjatype-youtube-short.mp4'),'-an','-c:v','copy','-movflags','+faststart',str(OUT/'ninjatype-youtube-short-silent.mp4')],check=True)
    info=subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(OUT/'ninjatype-youtube-short.mp4')],text=True)
    (OUT/'export-info.json').write_text(info)
    print('Finished:',OUT/'ninjatype-youtube-short.mp4',flush=True)

if __name__=='__main__':main()
