import html from 'snabby';

const css = `
.gator-tabs-container {
  display:flex;
  flex-direction:column;
  width:100%;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.gator-tabs-header {
  background-color: whitesmoke;
  display:flex;
  flex-wrap:wrap;
  padding:0;
  margin: 0;
  list-style:none;
   box-sizing:border-box;
}

.gator-tabs-header > li {
  color: black;
  cursor:pointer;
  flex-grow:1;
  padding: .375rem;
  padding-left: 1em;
  font-size:1.125rem;
  border-right: 1px solid #e0e0e0;
  border-radius: 4px;
}

.gator-tabs {
  display:flex;
  background-color: white;
  margin: 0;
  padding: 0;
}

.gator-tab {
  padding: 1rem;
  color: black;
}`;


function init (options={}) {
    return {
        selectedTabIdx: (options.selectedIndex === undefined) ? 0 : options.selectedIndex,
        headers: options.headers || [ ]
    }
}


function view (model, tabViews, update) {
    const _setTab = function (idx) {
        model.selectedTabIdx = idx;
        update();
    };

    const headers = model.headers.map((t, idx) => {
        return html`<li @style:color=${idx === model.selectedTabIdx ? 'black' : '#444'}
                        @style:background-color=${idx === model.selectedTabIdx ? 'white' : ''}
                        @on:click=${() => _setTab(idx)}> ${t}</li>`
    });

    const tabs = tabViews.map((t, idx) => {
        return html`<li class="gator-tab"
                        @style:display=${idx === model.selectedTabIdx ? 'flex' : 'none'}>${t}</li>`
    });

    return html`<div class="gator-tabs-container">
        <style>${css}</style>
        <ul class="gator-tabs-header">${headers}</ul>
        <ul class="gator-tabs">${tabs}</ul>
    </div>`;
}


var tabs = { init, view };

export default tabs;
