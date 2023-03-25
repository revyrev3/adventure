const storyTitle = document.getElementById("story-title");
const storyImage = document.getElementById("story-image");
const storyText = document.getElementById("story-text");
const choicesContainer = document.getElementById("choices-container");

function parseCSV(csv) {
    const rows = csv.split("\n").slice(1);
    const scenes = {};

    for (const row of rows) {
        if (!row) continue;
        const [scene_id, text, choice_text, next_scene_id, voice_index, pitch] = row.split(",");
        if (!scenes[scene_id]) {
            scenes[scene_id] = { id: scene_id, text, choices: [], voiceIndex: voice_index, pitch: pitch };
        }
        if (choice_text) {
            scenes[scene_id].choices.push({ text: choice_text, nextScene: next_scene_id });
        }
    }

    return { title: "Adventure in the Forest", scene: scenes["start"], scenes };
}

function readText(text, voiceIndex, pitch) {
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = speechSynthesis.getVoices();
    if (voices.length > 0 && voiceIndex >= 0 && voiceIndex < voices.length) {
        utterance.voice = voices[voiceIndex];
    }
    utterance.pitch = parseFloat(pitch) || 1;
    speechSynthesis.speak(utterance);
}

function startScene(story, scene) {
    const imageUrl = `${scene.id}.png`;
    document.body.style.backgroundImage = `url(${imageUrl})`;

    storyText.textContent = scene.text;
    readText(scene.text, scene.voiceIndex, scene.pitch);

    choicesContainer.innerHTML = "";
    if (scene.choices) {
        for (const choice of scene.choices) {
            const button = document.createElement("button");
            button.textContent = choice.text;
            button.addEventListener("click", () => {
                startScene(story, story.scenes[choice.nextScene]);
            });
            choicesContainer.appendChild(button);
        }
    }
}


fetch("adventure.csv")
    .then((response) => response.text())
    .then((csv) => {
        const story = parseCSV(csv);
        storyTitle.textContent = story.title;
        startScene(story, story.scene);
    })
    .catch((error) => {
        console.error("Error fetching adventure data:", error);
    });
