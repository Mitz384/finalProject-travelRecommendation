document.getElementById("logo").addEventListener("click", () => {
    const about_content = document.getElementById("about_content");
    const home_content = document.getElementById("home_content");
    const contact_content = document.getElementById("contact_content");
    if (home_content.classList.contains("hidden")){ 
        home_content.classList.remove("hidden");
    }
    if (!about_content.classList.contains("hidden")){
        about_content.classList.add("hidden");
    }
    if (!contact_content.classList.contains("hidden")){
        contact_content.classList.add("hidden");
    }
})

document.getElementById("home").addEventListener("click", () => {
    const about_content = document.getElementById("about_content");
    const home_content = document.getElementById("home_content");
    const contact_content = document.getElementById("contact_content");
    if (home_content.classList.contains("hidden")){ 
        home_content.classList.remove("hidden");
    }
    if (!about_content.classList.contains("hidden")){
        about_content.classList.add("hidden");
    }
    if (!contact_content.classList.contains("hidden")){
        contact_content.classList.add("hidden");
    }
})

document.getElementById("about").addEventListener("click", () => {
    const about_content = document.getElementById("about_content");
    const home_content = document.getElementById("home_content"); 
    const contact_content = document.getElementById("contact_content");
    if (!home_content.classList.contains("hidden")){
        home_content.classList.add("hidden");
    }
    if (about_content.classList.contains("hidden")){ 
        about_content.classList.remove("hidden");
    }
    if (!contact_content.classList.contains("hidden")){
        contact_content.classList.add("hidden");
    }
})

document.getElementById("contact").addEventListener("click", () => {
    const about_content = document.getElementById("about_content");
    const home_content = document.getElementById("home_content"); 
    const contact_content = document.getElementById("contact_content");
    if (!home_content.classList.contains("hidden")){
        home_content.classList.add("hidden");
    }
    if (!about_content.classList.contains("hidden")){ 
        about_content.classList.add("hidden");
    }
    if (contact_content.classList.contains("hidden")){
        contact_content.classList.remove("hidden");
    }
})


// ----------------Search Feature------------------
function wordStandardize(word){
    word = word.toString();
    word = word.toLowerCase();

    if (word.endsWith("ies")) return word.slice(0, -3) + "y";
    else if (word.endsWith("es")) {
        const root = word.slice(0, -2);
        if (/(s|sh|ch|x|z)$/.test(root)) return word.slice(0, -2);
        return word.slice(0, -1);
    } else if (word.endsWith("s")) return word.slice(0, -1);

    return word;
}

function searchHanlder(data, inputSearch){
    const normalizedWords = new Set(inputSearch.split(" ").map(wordStandardize));
    let matchedKeys = []
    let results = new Set();

    // O(n^2)
    const searchInData = (dataset, words) => {
        const matches = [];
        words.forEach(word => {
            dataset.forEach(record => {
                if (record["name"].normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().includes(word)){
                    if (record.hasOwnProperty("cities")){
                        record["cities"].forEach(ct => matches.push(ct));
                    } else {
                        matches.push(record);
                    }
                } else if (record.hasOwnProperty("cities")) {
                    record["cities"].forEach(ct => {
                        if (ct["name"].normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().includes(word)) matches.push(ct);
                    });
                }
            })
        });
        return matches;
    }

    // Check main key in data
    Object.keys(data).forEach(key => {
        const normalizedKey = wordStandardize(key);
        if (normalizedWords.has(normalizedKey)) {
            matchedKeys.push(data[key]);
            normalizedWords.delete(normalizedKey);
        }
    });

    // If there are remaining words, search in the data
    if (normalizedWords.size > 0){
        const words = Array.from(normalizedWords);
        const datasetsToSearch = matchedKeys.length > 0 ? matchedKeys : Object.values(data);

        datasetsToSearch.forEach(dataset => {
            const records = searchInData(dataset, words)
            if (records.length > 0) {
                records.forEach(record => {
                    results.add(record); 
                })
            }
        });
    } else {
        matchedKeys = new Set(matchedKeys);
        matchedKeys = Array.from(matchedKeys);
        matchedKeys.forEach(records => {
            records.forEach(record => {
                results.add(record);
            })
        })
    }
    return Array.from(results);
    
}

function search(){
    fetch("./travel_recommendation_api.json")
        .then(response => {
            return response.json();
        })
        .then(data => {
            const inputSearch = document.getElementById("inputSearch").value.trim();
            const result = searchHanlder(data, inputSearch);
            if (result.length === 0) {
                alert("No value found for keyword");
                return;
            }

            const resultDiv = document.getElementById("result");
            resultDiv.innerHTML = "";            
            result.forEach(record => {
                const cardDiv = document.createElement("div");
                cardDiv.classList.add("flex", "flex-col", "gap-4", "text-black", "bg-white", "rounded-xl", "pb-6");

                const img = document.createElement("img");
                img.src = record["imageUrl"];
                img.classList.add("rounded-t-xl");

                const contentDiv = document.createElement("div");
                contentDiv.classList.add("px-5", "flex", "flex-col", "gap-2");

                const h3 = document.createElement("h3");
                h3.classList.add("font-semibold", "text-xl");
                h3.textContent = record["name"];

                const p = document.createElement("p");
                p.classList.add("text-gray-500");
                p.textContent = record["description"];

                contentDiv.appendChild(h3);
                contentDiv.appendChild(p);

                const button = document.createElement("button");
                button.classList.add("bg-sky-300", "ml-5", "w-fit", "px-5", "py-1", "rounded-md", "text-white", "cursor-pointer");
                button.textContent = "Visit";

                cardDiv.appendChild(img);
                cardDiv.appendChild(contentDiv);
                cardDiv.appendChild(button);
                resultDiv.appendChild(cardDiv);
            });
            return result;
        })
        .then(result => {
            const section = document.querySelector('section');
            const resultDiv = document.getElementById("result");

            if (result.length === 1){
                section.style.removeProperty("height");
            }
            else{
                // Use requestAnimationFrame to ensure DOM updates are complete
                requestAnimationFrame(() => {
                    setTimeout(() => {
                        const res_height = resultDiv.getBoundingClientRect().height;
        
                        // Optionally, adjust the section height dynamically
                        section.style.setProperty("height", `${0.25*10*16*2 + res_height}px`); // Add padding if needed
                    }, 100); 
                });
            }
        })
        .catch(error => {
            console.error("An error occurred: ", error);
        })
}

document.getElementById("searchBtn").addEventListener("click", search);
document.getElementById("inputSearch").addEventListener("keyup", (event) => {
    if (event.key === "Enter") search();
});

function clear(){
    document.getElementById("inputSearch").value = "";
    document.getElementById("result").innerHTML = ""; 

    const section = document.querySelector('section');
    section.style.removeProperty("height");
}
document.getElementById("clearBtn").addEventListener("click", clear);

document.getElementById("submitBtn").addEventListener("click", () => {
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const message = document.getElementById("message").value;

    if (name && email && message) alert("Thanks for contacting us!");
    else alert("Please fill in all information!");
})