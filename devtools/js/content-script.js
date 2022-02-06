window.addEventListener("load", function (event) {
	chrome.runtime.sendMessage({ type: "reload", value: window.location.href });
});
