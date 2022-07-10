window.addEventListener("DOMContentLoaded",() => {
	// check if the OS theme is dark
	if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
		const dark = document.getElementById("dark");
		if (dark) dark.checked = true;
	}
});