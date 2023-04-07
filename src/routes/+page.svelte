<script>
  let inVttText = "";
  let outText = "";
  function convertVttText() {
    let converted = inVttText.replace(/.*-->.*\n/g, '');
    converted = converted.replace(/WEBVTT\n/g, '');
    converted = converted.replace(/(\r\n|\n\r|\n|\r)(\r\n|\n\r|\n|\r)/g, '\n');
    converted = converted.replace(/^(\r\n|\n\r|\n|\r)/g, '');
    converted = converted.replace(/(\r\n|\n\r|\n|\r)$/g, '');
    outText = converted;
  }
</script>

<h1>VTT formatter for text</h1>

<div>
  <label for="inVttText">VTT text:</label>
  <textarea id="inVttText" bind:value={inVttText}></textarea>
</div>

<button on:click|preventDefault={convertVttText}>Convert!</button>

<div>
  <label for="outText">Output text:</label>
  <textarea id="outText" readonly bind:value={outText}></textarea>
</div>

<style>
  textarea {
    width: 100%;
    height: 5rem;
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