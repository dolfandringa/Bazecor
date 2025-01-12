// -*- mode: js-jsx -*-
/* Bazecor
 * Copyright (C) 2022  Dygmalab, Inc.
 *
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software
 * Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Styled from "styled-components";
import { useMachine } from "@xstate/react";
import i18n from "../../i18n";
import SemVer from "semver";

// State machine
import FlashDevice from "../../controller/FlashingSM/FlashDevice";

// Visual components
import Title from "../../component/Title";
import { RegularButton } from "../../component/Button";
import { StepsBar } from "../../component/StepsBar";
import { IconArrowRight } from "../../component/Icon";
import { FirmwareLoader } from "../../component/Loader";

// Visual modules
import { FirmwareProgressStatus } from "../Firmware";

const Style = Styled.div`   
width: 100%;  
height: inherit;
.firmware-wrapper {
  max-width: 680px;   
  width: 100%;
  margin: auto;
  .firmware-row {
    width: 100%;
    display: flex;
    flex-wrap: nowrap;
  }
  .firmware-content {
    flex: 0 0 66%;
    background: ${({ theme }) => theme.styles.firmwareUpdatePanel.backgroundContent}; 
  }
  .firmware-sidebar {
    flex: 0 0 34%;
    background: ${({ theme }) => theme.styles.firmwareUpdatePanel.backgroundSidebar}; 
  }
  .firmware-content--inner {
    padding: 32px;
  }
  .borderLeftTopRadius {
    border-top-left-radius: 14px;
  } 
  .borderRightTopRadius {
    border-top-right-radius: 14px;
  }
  .borderLeftBottomRadius {
    border-bottom-left-radius: 14px;
  } 
  .borderRightBottomRadius {
    border-bottom-right-radius: 14px;
  }
}
.firmware-footer {
  width: 100%;
  margin-top: 62px;
}
.holdButton { 
  margin-bottom: 32px;
  display: flex;
  grid-gap: 8px;
}
.holdTootip {
  h6 {
    font-size: 13px;  
    font-weight: 395;
    letter-spacing: 0;
    color:  ${({ theme }) => theme.colors.gray300}; 
  }
}
.progress-visualizer {
  margin-top: 1rem;
  margin-bottom: 1rem;
}
`;

/**
 * This FirmwareUpdateProcess function returns a module that wrap all modules and components to manage the first steps of firware update.
 * The object will accept the following parameters
 *
 * @param {number} disclaimerCard - Number that indicates the software when the installation will begin.
 * @returns {<FirmwareUpdateProcess>} FirmwareUpdateProcess component.
 */

const FirmwareUpdateProcess = ({ nextBlock, retryBlock, context, toggleFlashing, toggleFwUpdate, onDisconnect, device }) => {
  const [toggledFlashing, sendToggledFlashing] = useState(false);
  const [state, send] = useMachine(FlashDevice, {
    context: {
      device: context.device,
      originalDevice: device,
      backup: context.backup,
      firmwares: context.firmwares,
      isUpdated: context.isUpdated,
      versions: context.versions,
      RaiseBrightness: context.RaiseBrightness,
      sideLeftOk: context.sideLeftOk,
      sideLeftBL: context.sideLeftBL,
      sideRightOK: context.sideRightOK,
      sideRightBL: context.sideRightBL
    },
    actions: {
      addEscListener: () => {
        console.log("added event listener");
        document.addEventListener("keydown", _handleKeyDown);
      },
      removeEscListener: () => {
        console.log("removed event listener");
        document.removeEventListener("keydown", _handleKeyDown);
      },
      toggleFlashing: async () => {
        if (toggledFlashing) return;
        console.log("starting flashing indicators");
        await toggleFlashing();
        toggleFwUpdate();
        sendToggledFlashing(true);
      },
      finishFlashing: async () => {
        if (!toggledFlashing) return;
        sendToggledFlashing(false);
        console.log("closing flashin process");
        await toggleFlashing();
        toggleFwUpdate();
        onDisconnect();
      }
    }
  });

  const _handleKeyDown = event => {
    switch (event.keyCode) {
      case 27:
        console.log("esc key logged");
        send("ESCPRESSED");
        break;
      default:
        break;
    }
  };

  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (state.context.stateblock > 0) {
      setLoading(false);
    }
    if (state.matches("success")) nextBlock(state.context);
  }, [state.context]);

  const stepsDefy = [
    { step: 1, title: i18n.firmwareUpdate.texts.flashCardTitle1, description: i18n.firmwareUpdate.texts.flashCardTitle2 },
    { step: 2, title: "1. Flashing rigth side", description: "Updating right side of the keyboard" },
    { step: 3, title: "2. Flashing left side", description: "Updating left side of the keyboard" },
    { step: 4, title: "3. Resetting the Neuron", description: "Preparing the bootloader!" },
    { step: 5, title: "4. Flashing Neuron", description: "Making it better 🎂 " },
    { step: 6, title: "5. Restoring your Layers!", description: "Giving your things back! 💪" },
    { step: 7, title: "6. Firmware update!", description: "Solid as a rock! 💪" },
    { step: 8, title: "Firmware update error!", description: "Errors!!!! 🫠" }
  ];
  const stepsRaise = [
    { step: 1, title: i18n.firmwareUpdate.texts.flashCardTitle1, description: i18n.firmwareUpdate.texts.flashCardTitle2 },
    { step: 4, title: i18n.firmwareUpdate.texts.progressCardStatus1, description: i18n.firmwareUpdate.texts.progressCardBar1 },
    { step: 5, title: i18n.firmwareUpdate.texts.progressCardStatus2, description: i18n.firmwareUpdate.texts.progressCardBar2 },
    { step: 6, title: i18n.firmwareUpdate.texts.progressCardStatus3, description: i18n.firmwareUpdate.texts.progressCardBar3 },
    { step: 7, title: i18n.firmwareUpdate.texts.progressCardStatus4, description: i18n.firmwareUpdate.texts.progressCardBar4 },
    {
      step: 8,
      title: i18n.firmwareUpdate.texts.errorDuringProcessTitle,
      description: i18n.firmwareUpdate.texts.errorDuringProcessDescription
    }
  ];

  return (
    <Style>
      {loading ? (
        <FirmwareLoader />
      ) : (
        <div className="firmware-wrapper upgrade-firmware">
          <div className="firmware-row progress-visualizer">
            <FirmwareProgressStatus
              flashProgress={state.context.globalProgress}
              leftProgress={state.context.leftProgress}
              retriesLeft={state.context.retriesLeft}
              rightProgress={state.context.rightProgress}
              retriesRight={state.context.retriesRight}
              resetProgress={state.context.resetProgress}
              neuronProgress={state.context.neuronProgress}
              retriesNeuron={state.context.retriesNeuron}
              retriesDefyWired={state.context.retriesDefyWired}
              restoreProgress={state.context.restoreProgress}
              countdown={state.context.stateblock}
              deviceProduct={state.context.device.info.product}
              keyboardType={state.context.device.info.keyboardType}
              steps={state.context.device.info.product == "Defy" ? stepsDefy : stepsRaise}
            />
          </div>
          {state.context.stateblock == 1 ? (
            <div className="firmware-footer">
              <div className="holdButton">
                <RegularButton
                  className="flashingbutton nooutlined"
                  style="outline"
                  size="sm"
                  buttonText={i18n.firmwareUpdate.texts.cancelButton}
                  onClick={() => {
                    retryBlock();
                  }}
                />
              </div>
              <div className="holdTootip">
                <Title
                  text={i18n.firmwareUpdate.texts.flashCardHelp}
                  headingLevel={6}
                  tooltip={i18n.firmwareUpdate.texts.flashCardHelpTooltip}
                  tooltipSize="wide"
                />
              </div>
            </div>
          ) : (
            ""
          )}
          {state.context.stateblock == 8 ? (
            <div className="firmware-footer">
              <div className="holdButton">
                <RegularButton
                  className="flashingbutton nooutlined"
                  style="outline"
                  size="sm"
                  buttonText={i18n.firmwareUpdate.texts.cancelButton}
                  onClick={() => {
                    send("CANCEL");
                    retryBlock();
                  }}
                />
                <RegularButton
                  className="flashingbutton nooutlined"
                  style="primary"
                  size="sm"
                  buttonText={"Retry the flashing procedure"}
                  onClick={() => {
                    send("RETRY");
                  }}
                />
              </div>
              <div className="holdTootip">
                <Title
                  text={i18n.firmwareUpdate.texts.flashCardHelp}
                  headingLevel={6}
                  tooltip={i18n.firmwareUpdate.texts.flashCardHelpTooltip}
                  tooltipSize="wide"
                />
              </div>
            </div>
          ) : (
            ""
          )}
        </div>
      )}
      {/* <hr />
      <div>
        <h3>percentages</h3>
        <div>
          <div>{`global Percentage: ${state.context.globalProgress}`}</div>
          <div>{`left Percentage: ${state.context.leftProgress}`}</div>
          <div>{`right Percentage: ${state.context.rightProgress}`}</div>
          <div>{`reset Percentage: ${state.context.resetProgress}`}</div>
          <div>{`neuron Percentage: ${state.context.neuronProgress}`}</div>
          <div>{`restore Percentage: ${state.context.restoreProgress}`}</div>
        </div>
      </div> */}
    </Style>
  );
};

export default FirmwareUpdateProcess;
