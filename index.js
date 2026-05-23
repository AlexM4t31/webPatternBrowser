const form = document.getElementById("filterForm");
const statusEl = document.getElementById("status");
//const resultCountEl = document.getElementById("resultCount");
const resultImageEl = document.getElementById("resultImage");
const resultNameEl = document.getElementById("resultName");

const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

const IMAGE_PREFIX = "https://pub-40020cc860ed4bf59481c2919eb1b393.r2.dev/patternimages/";

let indexData = null;
let currentMatches = [];
let currentIndex = 0;

function buildImagePath(imgName) {
    const cleanPrefix = IMAGE_PREFIX.replace(/[\\/]+$/, "");
    const cleanName = imgName.replace(/^[\\/]+/, "");
    return `${cleanPrefix}/${cleanName}`;
}

async function loadIndexData() {
    if (indexData) return indexData;
    const response = await fetch("./data/index.json");
    if (!response.ok) {
        throw new Error(`Failed to load index.json: ${response.status}`);
    }
    indexData = await response.json();
    return indexData;
}

function getSelections() {
    return {
        param1: form.elements["param1"].value,
        param2: form.elements["param2"].value,
        param3: form.elements["param3"].value,
        param4: form.elements["param4"].value,
        param5: form.elements["param5"].value,
        param6: form.elements["param6"].value,
        param7: form.elements["param7"].value,
        param8: form.elements["param8"].value
    };
}

function intersectTwo(a, b) {
    const bSet = new Set(b);
    return a.filter(x => bSet.has(x));
}

function intersectLists(lists) {
    if (lists.length === 0) return [];
    lists.sort((a, b) => a.length - b.length);
    return lists.reduce((acc, list) => intersectTwo(acc, list));
}

function showCurrentImage() {
    if (currentMatches.length === 0) {
        resultImageEl.style.display = "none";
        resultImageEl.src = "";
        resultNameEl.textContent = "";
        //resultCountEl.textContent = "0 matches";
        statusEl.textContent = "No images match the selected parameter values.";
        prevBtn.disabled = true;
        nextBtn.disabled = true;
        return;
    }

    const imgName = currentMatches[currentIndex];
    resultImageEl.src = buildImagePath(imgName);
    resultImageEl.style.display = "block";
    resultNameEl.textContent = imgName;
    //resultCountEl.textContent = `${currentMatches.length} matches`;
    statusEl.textContent = `Showing image ${currentIndex + 1} of ${currentMatches.length}`;

    //prevBtn.disabled = currentIndex === 0;
    //nextBtn.disabled = currentIndex === currentMatches.length - 1;
}

prevBtn.addEventListener("click", () => {
    if (currentMatches.length === 0) return;
    currentIndex = (currentIndex - 1 + currentMatches.length) % currentMatches.length;
    showCurrentImage();
});

nextBtn.addEventListener("click", () => {
    if (currentMatches.length === 0) return;
    currentIndex = (currentIndex + 1) % currentMatches.length;
    showCurrentImage();
});

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
        statusEl.textContent = "Loading index...";
        const data = await loadIndexData();

        const selected = getSelections();

        const lists = [
            data.param1?.[selected.param1] ?? [],
            data.param2?.[selected.param2] ?? [],
            data.param3?.[selected.param3] ?? [],
            data.param4?.[selected.param4] ?? [],
            data.param5?.[selected.param5] ?? [],
            data.param6?.[selected.param6] ?? [],
            data.param7?.[selected.param7] ?? [],
            data.param8?.[selected.param8] ?? []
        ];

        currentMatches = intersectLists(lists);

        currentMatches.sort(function(a,b){
            aInstNo = parseInt(a.substring(a.indexOf('-')+1,a.indexOf('.')));

            console.log(aInstNo);

            bInstNo = parseInt(b.substring(b.indexOf('-')+1,b.indexOf('.')));

            console.log(bInstNo);

            return aInstNo>bInstNo ? 1 : -1;
        });

        currentIndex = 0;

        showCurrentImage();
    } catch (err) {
        console.error(err);
        statusEl.textContent = "Error loading or processing index.json.";
    }
});