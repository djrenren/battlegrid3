window.onload = () => {
  if (IS_DEV) {
    console.log("Live reload enabled");
    const eventSource = new EventSource("/esbuild");
    eventSource.addEventListener("change", () => {
      console.log("hi");
      location.reload();
    });
    window.addEventListener("beforeunload", function () {
      if (eventSource != null) {
        eventSource.close();
      }
    });
  }
};
