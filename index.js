// API Documentation: 
// https://api.ideaharbor.xyz/api/v1/ideas?type=all-ideas&search=&page=2
// ok thanks

let newest = null
let page = 1

const fetchPage = async (page) => {
    // I don't care enough to not just use this random thing.
    const res = await (await fetch("https://corsproxy.io/?url=https://api.ideaharbor.xyz/api/v1/ideas%3Ftype=all-ideas%26search=%26page=" + page)).json();
    console.log(res);
    return res.ideas;
}

const escapeHTML = str => str.replace(/[&<>'"]/g, 
    tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag]));

const getIdeaHTML = (idea) => {
    const content = escapeHTML(idea.idea);
    const author = escapeHTML(idea.author.name);
    const date = new Date(idea.createdAt);
    const month = date.toLocaleString('default', { month: 'long' });
    const day = date.getDate();
    const year = date.getFullYear();
    const html = `
        <div>
            <p class="publicity"><img src="globe.svg"/>Public</p>
            <a href="https://bsky.app/intent/compose?text=${ encodeURIComponent(content) }"><img src="bsky.svg"/></a>
            <p class="content">${ content }</p>
        </div>
        <p class="footer">${ month } ${ day }, ${ year } &middot; ${ author }</p>
    `;
    const div = document.createElement('div');
    div.classList.add('item');
    div.innerHTML = html;
    return div;
}

const addIdeaStart = (idea) => {
    const el = document.getElementById('container');
    const i = idea.map(getIdeaHTML);
    el.prepend(...i);
}

const addIdeaEnd = (idea) => {
    const el = document.getElementById('container');
    el.append(...idea.map(getIdeaHTML));
}

let first = true;

const loadNewContent = async () => {
    let f = first;
    first = false;
    const content = await fetchPage(1);
    const is = [];
    for (idea of content) {
        if (idea.id == newest)
            break;
        is.push(idea);
    }
    addIdeaStart(is);
    newest = content[0].id;
}

let loadingOld = false;

const loadOldContent = async () => {
    if (loadingOld)
        return;
    loadingOld = true;

    const content = await fetchPage(++page);
    addIdeaEnd(content);

    loadingOld = false;
}

window.onscroll = function(ev) {
    if ((window.innerHeight + Math.round(window.scrollY)) >= document.body.offsetHeight) {
        loadOldContent();
    }
};

loadNewContent();

//setInterval(loadNewContent, 30000);