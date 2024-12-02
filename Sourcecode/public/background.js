chrome.action.onClicked.addListener(() => {
  chrome.windows.create(
    {
      url: "index.html", // Path to your React app's entry point
      type: "popup",
      width: 375, // Width similar to a small phone
      height: 400, // Height similar to a small phone
      left: 1, // Position the window in the viewport (optional)
      top: 1, // Position the window in the viewport (optional)
    },
    (newWindow) => {
      console.log("Extension window opened with phone size:", newWindow);
    }
  );
});
