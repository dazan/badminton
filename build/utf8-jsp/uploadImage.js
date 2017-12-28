var uploadImageIcon = 'data:img/jpg;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAByUlEQVRYR+2XsS5EQRSGv30CSiqUKrQiQalCRccjUKrYTodegidAolPgDXgD3oAKFfk2M8nsjV33rp27JCbZ7N17587/n/P/58xsgwGPxoDx+SfwqzLwkdEPi8BNWL8J7EWsNAMS2Abu+0xEYAk4DoGLbgSceNtnAgYW13VtPx0z8GcJLAC7wDOgxqmMtWRA4KEg3SWwkshYC4G0gu4AMxJHLQQ2gRPgBfBap9dKoFvh/CgDw8AGMA4cAY89lGjPBAS3iUwHUMFngtOr8OiJgKDnIfIUTG1Xq6ADlQlYUkZuBr4atmtbatlRicAZsNwFPIIqRXHP0CdjwENBpkoEykZV9EMsQ983g7b0SDALAYGiH1LwGIAkDoJfoomdP/Hdblg2A3Gei6ZtN33/HVgPu59+sjseA1fpO8XzQFUCnea/AaNBDr3hULY54BpYitt+LgJppcS9P/2WlNK1nYr7eSQzMEHsonFj8iBilXlff1hJWQmouwZsRQqchsrwnn2kZc5cEuwDOwG4KIHPRnJL8ApMAk9JO9eEa2Hbno19Itf/AtM9D2yFzqgc/jYbGtTnrZGLgGurvQSmApZHNbVvO3XnJFCqpwycwCfya6AhY6x1TgAAAABJRU5ErkJggg=='

window.UE.registerUI('imageUpload', (editor, uiName) => {
      var btn = new window.UE.ui.Button({
        name: uiName,
        title: '文件上传',
        cssRules: 'background: url(' + uploadImageIcon + ') !important; background-size: 20px 20px !important;',
        onclick: () => {
          tempfileInput.click()
        }
      })
      return btn;
});