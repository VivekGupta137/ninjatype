# Executed through browser-harness; uses normal browser navigation, clicks, and typing.
import json, time, re
from pathlib import Path
switch_tab('737346F8562966B2A154DB8869F13D51')
answers=json.loads(Path('artifacts/quora/answers.json').read_text())
posted_path=Path('artifacts/quora/posted.json')
posted=json.loads(posted_path.read_text()) if posted_path.exists() else []

def wait_until(fn, timeout=12):
    end=time.monotonic()+timeout
    while time.monotonic()<end:
        try:
            if fn(): return
        except Exception:
            pass
        time.sleep(.5)
    raise RuntimeError('Expected browser state did not appear')

def press(name, prefix=False):
    ns=cdp('Accessibility.getFullAXTree')['nodes']
    candidates=[n for n in ns if n.get('role',{}).get('value')=='button' and ((n.get('name',{}).get('value','').startswith(name)) if prefix else n.get('name',{}).get('value')==name)]
    for n in candidates:
        try:
            q=cdp('DOM.getBoxModel',backendNodeId=n['backendDOMNodeId'])['model']['content']
            x,y=sum(q[0::2])/4,sum(q[1::2])/4
            vp=js('({w:innerWidth,h:innerHeight})')
            if 0<x<vp['w'] and 0<y<vp['h']:
                click_at_xy(x,y);return
        except Exception: pass
    if not candidates: raise RuntimeError('No button: '+name)
    n=candidates[0]
    cdp('DOM.scrollIntoViewIfNeeded',backendNodeId=n['backendDOMNodeId'])
    time.sleep(.8)
    q=cdp('DOM.getBoxModel',backendNodeId=n['backendDOMNodeId'])['model']['content']
    x,y=sum(q[0::2])/4,sum(q[1::2])/4
    vp=js('({w:innerWidth,h:innerHeight})')
    if not (0<x<vp['w'] and 0<y<vp['h']): raise RuntimeError('Button outside viewport: '+name)
    click_at_xy(x,y)

selected=[a for a in answers if a['question'] not in {p['question'] for p in posted}][:BATCH_SIZE]
for a in selected:
    try:
        goto_url(a['url']);wait_for_load()
        wait_until(lambda: js("document.body?.innerText ?? ''").find(a['question'])>=0)
        ns=cdp('Accessibility.getFullAXTree')['nodes']
        candidates=[n for n in ns if n.get('role',{}).get('value')=='button' and (n.get('name',{}).get('value','')=='Answer' or n.get('name',{}).get('value','').startswith('Answer ·'))]
        if candidates:
            press('Answer',prefix=True)
        elif a['question']=='What are some of the best typing games?':
            press('Edit draft',prefix=True)
        else:
            raise RuntimeError('Question has no Answer button; may already be answered or restricted')
        wait_until(lambda: js("!!document.querySelector('[role=dialog] [contenteditable=true]')"))
        old=js("document.querySelector('[role=dialog] [contenteditable=true]').innerText")
        own_draft=a['question']=='What are some of the best typing games?' and old.split()[:20]==a['answer'].split()[:20]
        if old.strip() and not own_draft: raise RuntimeError('Existing draft found; preserved instead of overwriting')
        root=cdp('DOM.getDocument')['root']['nodeId'];node=cdp('DOM.querySelector',nodeId=root,selector='[role=dialog] [contenteditable=true]')['nodeId']
        q=cdp('DOM.getBoxModel',nodeId=node)['model']['content'];click_at_xy(sum(q[0::2])/4,sum(q[1::2])/4)
        if old.strip():
            cdp('Input.dispatchKeyEvent',type='keyDown',key='a',code='KeyA',modifiers=4)
            cdp('Input.dispatchKeyEvent',type='keyUp',key='a',code='KeyA',modifiers=4)
        cdp('Input.insertText',text=a['answer'])
        actual=js("document.querySelector('[role=dialog] [contenteditable=true]').innerText")
        if actual.split()!=a['answer'].split(): raise RuntimeError('Editor text verification failed; answer not submitted')
        press('Post')
        wait_until(lambda: '/answer/Vivek-Gupta-996' in js('location.href'),20)
        wait_until(lambda: a['answer'][:65] in js("document.body?.innerText ?? ''"),20)
        permalink=js("location.href.split('?')[0]")
        posted.append({'question':a['question'],'url':permalink,'status':'published and verified'})
        posted_path.write_text(json.dumps(posted,indent=2,ensure_ascii=False))
        print('PUBLISHED',len(posted),permalink,flush=True)
        # Retain the current, existing credential; do not invent new account credentials.
        ns=cdp('Accessibility.getFullAXTree')['nodes']
        if any(n.get('role',{}).get('value')=='button' and n.get('name',{}).get('value')=='Done' for n in ns):press('Done')
    except Exception as e:
        error={'question':a['question'],'url':js('location.href'),'error':str(e)}
        Path('artifacts/quora/posting-error.json').write_text(json.dumps(error,indent=2))
        print('STOPPED',error,flush=True)
        break
print('Published total:',len(posted),flush=True)
