(() => {
  try {
    const win = window;
    const result = {
      innerWidth: win.innerWidth || 0,
      innerHeight: win.innerHeight || 0,
      outerWidth: win.outerWidth || 0,
      outerHeight: win.outerHeight || 0,
      success: true
    };
    console.log('Injected viewport result:', result);
    return result;
  } catch (e) {
    return {
      success: false,
      error: e.message,
      innerWidth: 0,
      innerHeight: 0
    };
  }
})();
