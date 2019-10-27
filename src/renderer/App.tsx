import React, { useState, useEffect } from 'react'
import { Sample } from '../common/Sample';
import { ipcRenderer } from 'electron';

const App: React.FC = () => {

    const [samples, setSamples] = useState(new Array<Sample>())
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')

    useEffect(() => {
        ipcRenderer.once('get-sample-reponse', (event, samples: Array<Sample>) => {
            console.log(event)
            console.log(samples)
            setSamples(samples)
        })
    })

    return (
        <div>
            <ul>
                {samples.map((sample, i) => <li key={i}>{sample.id+'-'+ sample.title +'-'+sample.content}</li>)}
            </ul>
            <button onClick={() => {
                ipcRenderer.send('get-sample-request')
                console.log("send msg get samples")
            }}>
                show
            </button>
            <div>
                <label>
                    title:
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)}/>
                </label>
                <label>
                    content:
                    <input type="text" value={content} onChange={e => setContent(e.target.value)}/>
                </label>
            </div>
            <button onClick={() => {
                const s = new Sample()
                s.title = title
                s.content = content
                ipcRenderer.send('add-sample-request', s)
                console.log("send msg", s)
            }}>
                add
            </button>
        </div>
    )
}

export default App
