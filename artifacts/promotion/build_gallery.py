"""Build promotion cards from actual NinjaType browser captures (requires Pillow)."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageOps
import json, zipfile

ROOT = Path(__file__).resolve().parent
FONT = '/System/Library/Fonts/Avenir Next.ttc'
def font(size, bold=False): return ImageFont.truetype(FONT, size, index=0 if bold else 7)
SHOTS = [
    ('01-practice', '16-practice-active.png', 'Typing practice', 'Find your typing flow.', 'Timed tests, word lists, and accuracy feedback.', 'AMOLED', '#b7e4c7', '/'),
    ('02-touch-typing', '10-learn-nord.png', 'Touch typing', 'Learn the keys. Find your rhythm.', 'Build consistent habits with focused finger lessons.', 'Nord', '#88c0d0', '/learn/'),
    ('03-multiplayer', '11-multiplayer-nord.png', 'Typing race', 'Ready. Set. Type.', 'Quick races or a room to race with friends.', 'Nord', '#88c0d0', '/multiplayer-typing-race/'),
    ('04-ghost-race', '18-ghost-active.png', 'Ghost Race', 'Race your best self.', 'Chase your saved pace, one character at a time.', 'AMOLED', '#fbbf24', '/ghost-race/'),
    ('05-hacker-typer', '05-hacker-amoled.png', 'Hacker Typer', 'A terminal made for play.', 'Explore a simulated hacker screen in your browser.', 'CRT Green', '#78e78c', '/hacker-typer/'),
    ('06-history', '06-history-amoled.png', 'Typing history', 'See how far you have come.', 'Review your WPM, accuracy, and saved sessions.', 'AMOLED', '#90d986', '/history/'),
    ('07-themes', '15-theme-picker.png', 'Customization', 'Make it feel like you.', 'Choose a theme and shape your practice environment.', 'Dracula', '#ff79c6', '/settings/'),
    ('08-guides', '08-guides-amoled.png', 'Typing guides', 'Practice with a purpose.', 'Find practical guides for tests, lessons, and races.', 'AMOLED', '#cba6f7', '/blog/'),
    ('09-race-screen', '20-race-active.png', 'Race screen', 'Watch the race unfold.', 'Shared text, live progress, and a clear finish line.', 'AMOLED', '#90d986', '/multiplayer-typing-race/'),
]

def rgb(h): return tuple(int(h.lstrip('#')[i:i+2],16) for i in (0,2,4))
def background(w,h,accent):
    a=rgb(accent); im=Image.new('RGB',(w,h)); p=im.load()
    # Subtle tinted backdrop keeps the app screenshot as the focal point.
    for y in range(h):
        for x in range(w):
            glow=max(0,1-((x-w*.88)**2+(y-h*.06)**2)**.5/(w*.85))**2*.07
            p[x,y]=(int(9+a[0]*glow),int(12+a[1]*glow),int(18+a[2]*glow))
    return im

def browser_frame(canvas,shot,box,url,accent):
    x,y,w,h=box
    fitted=ImageOps.contain(shot,(w,h),Image.Resampling.LANCZOS)
    x+=(w-fitted.width)//2; y+=(h-fitted.height)//2
    w,h=fitted.size; shot=fitted
    bar=44 if canvas.width>1500 else 24; r=20 if canvas.width>1500 else 10
    mask=Image.new('L',(w,h+bar),0); md=ImageDraw.Draw(mask);md.rounded_rectangle((0,0,w-1,h+bar-1),r,fill=255)
    frame=Image.new('RGB',(w,h+bar),'#171c25');d=ImageDraw.Draw(frame)
    frame.paste(shot.resize((w,h),Image.Resampling.LANCZOS),(0,bar))
    for i,color in enumerate(['#596273','#596273','#596273']):
        size=10 if bar==44 else 6;cx=24+i*20 if bar==44 else 15+i*12
        d.ellipse((cx-size//2,bar//2-size//2,cx+size//2,bar//2+size//2),fill=color)
    d.text((w//2,bar//2),'ninjatype.com'+(url if url!='/' else ''),font=font(18 if bar==44 else 11),fill='#aab4c3',anchor='mm')
    shadow=Image.new('RGBA',canvas.size,(0,0,0,0));sd=ImageDraw.Draw(shadow);sd.rounded_rectangle((x-2,y+18,x+w+2,y+h+bar+20),r,fill=(0,0,0,180));shadow=shadow.filter(ImageFilter.GaussianBlur(20))
    canvas.paste(shadow,(0,0),shadow);canvas.paste(frame,(x,y),mask)
    d=ImageDraw.Draw(canvas);d.rounded_rectangle((x,y,x+w,y+h+bar),r,outline='#344050',width=2)


def wrap(text,f,width):
    lines=[];line=''
    for word in text.split():
        trial=(line+' '+word).strip()
        if f.getlength(trial)>width and line:lines.append(line);line=word
        else:line=trial
    if line:lines.append(line)
    return lines

for index,(slug,raw,label,title,subtitle,theme,accent,url) in enumerate(SHOTS,1):
    shot=Image.open(ROOT/'raw'/raw).convert('RGB')
    im=background(2400,1800,accent);d=ImageDraw.Draw(im)
    d.text((120,65),'NINJATYPE',font=font(31,True),fill='#f3f6fb')
    d.text((2280,67),f'{index:02d}  /  {label.upper()}',font=font(23),fill=accent,anchor='ra')
    d.text((120,139),title,font=font(84,True),fill='#f3f6fb')
    d.text((122,253),subtitle,font=font(33),fill='#b8c1d1')
    d.text((2280,276),theme.upper(),font=font(20),fill=accent,anchor='ra')
    browser_frame(im,shot,(120,350,2160,1350),url,accent)
    im.save(ROOT/'gallery'/(slug+'.png'),optimize=True)
    # Smaller files for direct app-directory uploads, preserving 4:3 proportions.
    im.resize((1600,1200),Image.Resampling.LANCZOS).save(ROOT/'gallery'/(slug+'.jpg'),quality=95,subsampling=0)
    social=background(1200,630,accent);d=ImageDraw.Draw(social)
    d.text((45,40),'NINJATYPE',font=font(21,True),fill='#f3f6fb')
    d.text((45,105),label.upper(),font=font(14),fill=accent)
    lines=wrap(title,font(42,True),355)
    for i,line in enumerate(lines):d.text((42,165+i*57),line,font=font(42,True),fill='#f3f6fb')
    for i,line in enumerate(wrap(subtitle,font(18),345)):d.text((45,180+len(lines)*57+i*29),line,font=font(18),fill='#b8c1d1')
    d.text((45,558),'ninjatype.com',font=font(20),fill=accent)
    browser_frame(social,shot,(425,83,730,456),url,accent)
    social.save(ROOT/'social'/(slug+'-1200x630.png'),optimize=True)

# Theme showcase: the same product in three real themes, with no UI recoloring.
im=background(2400,1800,'#cba6f7');d=ImageDraw.Draw(im)
d.text((120,65),'NINJATYPE',font=font(31,True),fill='#f3f6fb')
d.text((2280,67),'10  /  THEMES',font=font(23),fill='#cba6f7',anchor='ra')
d.text((120,139),'One app. Your atmosphere.',font=font(84,True),fill='#f3f6fb')
d.text((122,253),'AMOLED, Nord, Dracula—and more ways to make it yours.',font=font(33),fill='#b8c1d1')
for raw,(x,y,w,h),label,accent in [
    ('01-practice-amoled.png',(120,380,1280,800),'AMOLED','#b7e4c7'),
    ('09-practice-nord.png',(1000,650,1280,800),'NORD','#88c0d0'),
    ('12-practice-dracula.png',(250,960,1056,660),'DRACULA','#ff79c6')]:
    browser_frame(im,Image.open(ROOT/'raw'/raw).convert('RGB'),(x,y,w,h),'/',accent)
    d=ImageDraw.Draw(im);d.rounded_rectangle((x+28,y+62,x+188,y+108),10,fill='#171c25');d.text((x+46,y+70),label,font=font(19,True),fill=accent)
im.save(ROOT/'gallery'/'10-theme-showcase.png',optimize=True)
im.resize((1600,1200),Image.Resampling.LANCZOS).save(ROOT/'gallery'/'10-theme-showcase.jpg',quality=95,subsampling=0)

files=sorted((ROOT/'gallery').glob('*.jpg'))
preview=Image.new('RGB',(1600,1250),'#0b0f17');d=ImageDraw.Draw(preview)
d.text((25,18),'NinjaType — Product Hunt gallery',font=font(25,True),fill='#f3f6fb')
for i,p in enumerate(files):
    shot=Image.open(p);shot.thumbnail((495,372));x=25+(i%3)*525;y=70+(i//3)*290
    # Preview cards are scaled to 4:3 without cropping.
    shot=shot.resize((360,270),Image.Resampling.LANCZOS)
    preview.paste(shot,(x,y));d.text((x+370,y+5),f'{i+1:02d}',font=font(19),fill='#b8c1d1')
preview.save(ROOT/'contact-sheet.jpg',quality=94)
manifest={'source':'https://www.ninjatype.com','captured':'2026-10-28','viewport':{'width':1600,'height':1000,'deviceScaleFactor':2},'gallerySize':[2400,1800],'directorySize':[1600,1200],'socialSize':[1200,630],
          'items':[{'file':s[0],'label':s[2],'headline':s[3],'theme':s[5],'route':s[7],'raw':s[1]} for s in SHOTS]}
(ROOT/'manifest.json').write_text(json.dumps(manifest,indent=2))
print('Created 10 gallery cards (PNG + JPG), 9 social cards, and a contact sheet.')
