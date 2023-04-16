// You'll want to get your own clientId and clientSecret from https://develop.battle.net/access/clients
// At that point you can simply put it into a seperate file named config.js, within the same folder as this page.
// ... You could also just place it here if you really want to, in the format of: 
// export const clientId = "" AND export const clientSecret = "" Where "" are provided by Blizzard.

import { clientId, clientSecret } from './config.js';

async function getClientAccessToken(clientId, clientSecret) {
	const url = "https://us.battle.net/oauth/token";
	const data = new URLSearchParams();
	data.append("grant_type", "client_credentials");

	const basicAuthString = btoa(`${clientId}:${clientSecret}`);
	const response = await fetch(url, {
		method: "POST",
		body: data,
		headers: {
			Authorization: `Basic ${basicAuthString}`,"Content-Type": "application/x-www-form-urlencoded",
		},
	});
	const responseData = await response.json();
	return responseData.access_token;
}

async function getCharacterData(character, accessToken) {
	const [characterName, characterRealm] = character.split("-");
	const name = characterName.toLowerCase();
	let realm;
	if (!characterRealm || characterRealm === "kelthuzad") {
		realm = "kelthuzad";
	}
	else if (characterRealm === "Area52"){
		realm = "area-52";
	}
	else {
		const realmLower = characterRealm.replace(/\s/g, "-");
		realm = realmLower.replace(/([A-Z])/g, "-$1").toLowerCase().substring(1).replace(/'-/g, "").replace(/'/g, "");
	}
	const url = `https://us.api.blizzard.com/profile/wow/character/${realm}/${name}/collections/pets?namespace=profile-us&locale=en_US&access_token=${accessToken}`;

	const response = await fetch(url);
	if (!response.ok) {
		const resultDiv = document.createElement("div");
		resultDiv.innerHTML = `${response.statusText} - <a href="https://worldofwarcraft.blizzard.com/en-us/character/us/${realm}/${name}/collections/pets" target="_blank">${character}</a>`;

		results.appendChild(resultDiv);
		return []
	}
	else if (response.status === 404) { // Handle 404 error
		const resultDiv = document.createElement("div");
		resultDiv.innerHTML = `No pets found for ${character}: ${response.status} ${response.statusText}`;
		results.appendChild(resultDiv);
		return []
	} 
	const data = await response.json();
	await new Promise(resolve => setTimeout(resolve, 200)); // Wait before returning data to throttle requests
	if (data.pets) {
		return data.pets;
	} 
	else {
		return [];
	}
}

async function compareCollections(event) {
	event.preventDefault();
	const character = document.getElementById("character").value.trim();
	const accessToken = await getClientAccessToken(clientId, clientSecret);

	// Get the pet collection for the first character
	const pets1 = await getCharacterData(character, accessToken);

	// Get uploaded characterList file
	const fileInput = document.getElementById("fileInput");
	const file = fileInput.files[0];
	// Read uploaded file contents as text
	const reader = new FileReader();
	reader.readAsText(file);
	reader.onload = async function() {
		const resultList = reader.result.trim().replace(/-- \[\d+\]/, "").replace(/\"/g, "").split("\n").slice(1,-1);
		const characterList = resultList.filter(entry => !entry.includes("XXXXX"));
		// Loop through the rest of the characters and compare their pet collections
		const results = document.getElementById("results");
			
		for (let i = 0; i < characterList.length; i++) {
			const listEntry = characterList[i].trim();
			if (listEntry) { // Ignore empty lines
				const characterRealmFactionId = listEntry.split(" ; ");
				const character2 = characterRealmFactionId[0];
				const pets2 = await getCharacterData(character2, accessToken);
				// Compare the pet collections and count the number of pets that match
				if (pets2.length > 0) {
					let count = 0;
					for (let j = 0; j < pets1.length; j++) {
						if (pets2.some(pet2 => pet2.id === pets1[j].id)) {
							count++;
						}
					}
					// Display the results
					const resultDiv = document.createElement("div");
					if (count >= 1) {
						resultDiv.innerHTML = `${character} and ${character2} have ${count} pets in common.`;
						results.appendChild(resultDiv);
					}
				}
			}		
		}
	}
}
const form = document.querySelector("form");
form.addEventListener("submit", compareCollections);