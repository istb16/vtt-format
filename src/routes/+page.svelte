<script lang="ts">
  let inVttText = "";
  let outText = "";
  let dragging = false;
  function convertVttText() {
    let converted = normalizeNewLine(inVttText);
    if (isWebVtt(converted)) {
      converted = sortWebVtt(converted);
    }
    outText = converted;
  }

  interface WebVttCue {
    header: string;
    cues: string[];
  }

  function normalizeNewLine(text: string): string {
    return text.replace(/(\r\n|\n\r|\n|\r)/g, '\n');
  }

  function isWebVtt(text: string): boolean {
    return text.startsWith('WEBVTT');
  }

  function sortWebVtt(text: string): string{
    const lines = text.split('\n');
    const cues = readCueInWebVtt(lines);
    const sorted = sortWebVttCue(cues);
    const sortedText = sorted.flatMap(cue => cue.cues.flatMap(c => c));
    return sortedText.join("\n");
  }

  function readCueInWebVtt(lines: string[]): WebVttCue[] {
    let cues : WebVttCue[] = [];
    let isIgnore = true;
    lines.forEach(line => {
      if (line.match(/.*-->.*/)) {
        cues.push({header: line, cues: []});
        isIgnore = false;
      }
      else if (!isIgnore)
      {
        let value = line.trim();
        if (value.length <= 0) isIgnore = true;
        else cues[cues.length - 1].cues.push(value);
      }      
    });
    return cues;
  }

  function sortWebVttCue(cues: WebVttCue[]): WebVttCue[] {
    return cues.sort((a, b) => {
      let aTime = a.header.split(' --> ')[0];
      let bTime = b.header.split(' --> ')[0];
      return aTime.localeCompare(bTime);
    });
  }

  function inVttTextDragOver(event: DragEvent) {
    event.preventDefault();
  }

  function inVttTextDrop(event: DragEvent) {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          inVttText = e.target.result.toString();
          convertVttText();
        }
      };
      reader.readAsText(file);
    }
  }

  function copyToClipboardOutput() {
    copyToClipboard(outText);
    alert('Copied to your clipboard.');
  }

  function copyToClipboard(item: any): void {
    let listener = (e: ClipboardEvent) => {
        e.clipboardData?.setData('text/plain', (item));
        e.preventDefault();
    };

    document.addEventListener('copy', listener);
    document.execCommand('copy');
    document.removeEventListener('copy', listener);
  }
</script>

<h1>VTT formatter for text</h1>

<div>
  <label for="inVttText">VTT text:</label>
  <!-- svelte-ignore a11y-autofocus -->
  <textarea id="inVttText" bind:value={inVttText}
    class:dragging autofocus
    on:dragenter={_ => dragging = true}
    on:dragleave={_ => dragging = false}
    on:dragover={inVttTextDragOver}
    on:drop={ev => {dragging = false; inVttTextDrop(ev);}}></textarea>
</div>

<button on:click|preventDefault={convertVttText}>Convert</button>

<div>
  <label for="outText">Output text:</label>
  <textarea id="outText" readonly bind:value={outText}></textarea>
</div>

<button on:click|preventDefault={copyToClipboardOutput}>Copy Output</button>

<style>
  textarea {
    width: 100%;
    height: 30vh;
  }

  .dragging {
    background-image: url('drop.svg');
    background-repeat: no-repeat;
    background-position: center;
    background-size: 4rem;
    background-color: #ddd;
  }

  button {
    display: block;
    text-align: center;
    text-decoration: none;
    width: 15rem;
    margin: auto;
    padding: 1rem 4rem;
    font-weight: bold;
    border: 2px solid #27acd9;
    background: #27acd9;
    color: #fff;
    transition: 0.5s;
  }
  button:hover {
    color: #27acd9;
    background: #fff;
  }
</style>