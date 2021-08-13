class LayoutMapping {
  init(keyboard) {
    /**
     * Registering module
     */
    keyboard.registerModule("layoutMapping", (module) => {
      let { sourceLayout, targetLayout } = keyboard.options;

      module.fn = {};
      module.fn.handleButtonClicked = keyboard.handleButtonClicked;

      keyboard.handleButtonClicked = (button) => {
        console.log("** SOURCE BUTTON ***", button);
        const { targetButton } = module.getButtonInTargetLayout(button) || {};
        console.log("** TARGET BUTTON ***", targetButton);
        module.fn.handleButtonClicked(targetButton);
      };

      module.getButtonInTargetLayout = (button) => {
        let sourceButtonElement = module.getButtonInLayout(button);
        if (!sourceButtonElement) return;

        if (Array.isArray(sourceButtonElement)) {
          sourceButtonElement = sourceButtonElement[0];
        }

        console.log("sourceButtonElement", sourceButtonElement);

        const skbtnuid = sourceButtonElement.getAttribute("data-skbtnuid");
        const [sourceButtonLayoutName, sourceBtnLocation] = skbtnuid.split("-");
        const [sourceBtnRow, sourceBtnIndex] = sourceBtnLocation
          .replace("r", "")
          .split("b");

        const targetButton = module.findLayoutKeyByIndex(
          sourceBtnRow,
          sourceBtnIndex,
          targetLayout,
          sourceButtonLayoutName
        );

        return { targetButton, sourceBtnRow, sourceBtnIndex };
      };

      /**
       * Get button in layout
       */
      module.getButtonInLayout = (layoutKeyName) => {
        let buttonElement =
          keyboard.getButtonElement(layoutKeyName) ||
          keyboard.getButtonElement(`{${layoutKeyName}}`);

        return buttonElement;
      };

      /**
       * Find layout key by index
       */
      module.findLayoutKeyByIndex = (
        rIndex,
        bIndex,
        layout,
        layoutName = keyboard.options.layoutName
      ) => {
        let row = layout[layoutName][rIndex];

        if (row) {
          let rowButtons = row.split(" ");
          return rowButtons[bIndex];
        }
      };

      /**
       * Highlight button
       */
      module.keyboardPressButton = (event) => {
        const { layoutName } = keyboard.options;
        let physicalKeyboardKeyName = module.sourceLayoutKeyMaps(
          keyboard.physicalKeyboard.getSimpleKeyboardLayoutKey(event)
        );

        console.log("*** PRESSED KEY ***", physicalKeyboardKeyName);

        const { targetButton, sourceBtnRow, sourceBtnIndex } =
          module.getButtonInTargetLayout(physicalKeyboardKeyName) || {};

        // Find button elem
        const buttonElem = document.querySelector(
          `[data-skbtnuid="${layoutName}-r${sourceBtnRow}b${sourceBtnIndex}"]`
        );

        console.log("targetButton", targetButton, buttonElem);

        if (!targetButton) return;

        if (buttonElem) {
          buttonElem.classList.add("hg-activeButton");
        }

        module.fn.handleButtonClicked(targetButton);

        if (buttonElem) {
          const activeTimeout = setTimeout(() => {
            clearTimeout(activeTimeout);
            buttonElem.classList.remove("hg-activeButton");
          }, 100);
        }
      };

      /**
       * Define key listeners
       */
      module.initListeners = () => {
        /**
         * Handle keyboard press
         */
        document.addEventListener("keydown", (event) => {
          module.keyboardPressButton(event);
        });
      };

      /**
       * Custom layout overrides
       */
      module.sourceLayoutKeyMaps = (keyName) => {
        let retval;
        switch (keyName) {
          case "backspace":
            retval = "{bksp}";
            break;

          case "shiftleft":
            retval = "{shift}";
            break;

          case "shiftright":
            retval = "{shift}";
            break;

          case "space":
            retval = "{space}";
            break;

          case "enter":
            retval = "{enter}";
            break;

          case "capslock":
            retval = "{lock}";
            break;

          default:
            retval = keyName;
            break;
        }

        return retval;
      };

      /**
       * set display
       */
      module.setDisplay = () => {
        const layoutName = keyboard.options.layoutName;
        const display = {};

        /**
         * source and target must be of same size
         */
        sourceLayout[layoutName].forEach((row, rIndex) => {
          const rowArray = row.split(" ");
          rowArray.forEach((button, bIndex) => {
            const targetLayoutRowArray = targetLayout[layoutName][rIndex].split(
              " "
            );
            const targetButton = targetLayoutRowArray[bIndex];

            if (
              !(
                (targetButton.includes("{") && targetButton.includes("}")) ||
                (button.includes("{") && button.includes("}"))
              )
            ) {
              display[button] = targetButton;
            }
          });
        });

        keyboard.setOptions({
          display
        });
      };

      /**
       * Start module
       */
      module.start = () => {
        module.initListeners();

        keyboard.setOptions({
          layout: sourceLayout,
          mergeDisplay: true,
          onRender: () => module.setDisplay()
        });
      };

      module.start();
    });
  }
}

export default LayoutMapping;
