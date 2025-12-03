
const styles: Record<string, string> = {
    "Styl 1": "/style1.css",
    "Styl 2": "/style2.css",
    "Styl 3": "/style3.css"
};

let currentStyle = "/style1.css";


function applyStyle(path: string) {
    
    document.querySelectorAll('link[data-style]').forEach(el => el.remove());

    
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = path;
    link.setAttribute("data-style", "true");

    document.head.appendChild(link);

    currentStyle = path;
}

function createStyleSwitcher() {
    const container = document.querySelector(".p-container");
    if (!container) return;

    const list = document.createElement("ul");

    Object.entries(styles).forEach(([name, path]) => {
        const li = document.createElement("li");
        const a = document.createElement("a");

        a.href = "#";
        a.textContent = name;

        a.addEventListener("click", (e) => {
            e.preventDefault();
            applyStyle(path);
        });

        li.appendChild(a);
        list.appendChild(li);
    });

    container.appendChild(list);
}


createStyleSwitcher();
applyStyle(currentStyle);
