var jsPsychVaastFixation = (function(jspsych) {
  "use strict";  
  
  const info = {
    name: "vaast-fixation",
    version: "1.0.0",
    parameters: {
      /** The string to be displayed as fixation. */
      fixation: {
        type: jspsych.ParameterType.STRING,
        default: '+',
      },
      /** Font size of the text stimulus. */
      font_size: {
        type: jspsych.ParameterType.INTEGER,
        default: 200,
      },
      /** Minimal duration (in ms). */
      min_duration: {
        type: jspsych.ParameterType.INTEGER,
        default: 800,
      },
      /** Maximal duration (in ms). */
      max_duration: {
        type: jspsych.ParameterType.INTEGER,
        default: 2000,
      },
      /** The position in the "background_images" array which will be used to set the background. */
      position: {
        type: jspsych.ParameterType.INT,
        default: 3,
      },
      /** Array with the images displayed as background as function of the position. */
      background_images: {
        type: jspsych.ParameterType.ARRAY,
        default: undefined,
      }
    },
    data: {
      /** Duration of the fixation trial (in ms). */
      duration: {
        type: jspsych.ParameterType.INTEGER,
      },
    }
  }

  /**
   * VAAST implementation in jsPsych. 
   * (fixation trial)
   *
   * {description}
   *
   * @author cedric.batailler@univ-grenoble-alpes.fr
   * 
   ****************************************/

  class VaastFixationPlugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }
    trial(display_element, trial) {
      // Randomly selecting duration 
      var duration_range = trial.max_duration- trial.min_duration;
      var trialDuration = Math.random() * duration_range + trial.min_duration;
      
      // Affichage du stimulus
      var html_str = "";
      
      html_str += "<div style='position:absolute;right:0;top:0;width:100%; height:100%;background:url("+trial.background_images[trial.position]+") center no-repeat;z-index:-1'></div>";
      html_str += "<div style='height: 100vh; display: flex; justify-content: center; align-items: center;z-index:1; color: #ffffff; font-size: "+trial.font_size+"px' id='jspsych-iat-stim'>"+trial.fixation+"</div>";
      
      display_element.innerHTML = html_str;
      
      // function to end trial when it is time
      const end_trial = () => {
      
        // gather the data to store for the trial
        var trial_data = {
          duration: trialDuration,
        };
  
        // clears the display
        display_element.innerHTML = '';
  
        // move on to the next trial
        jsPsych.finishTrial(trial_data);
      };
      
      // end trial if time limit is set
      jsPsych.pluginAPI.setTimeout(function() {
        end_trial();
      }, trialDuration);
      
    };
  }
  VaastFixationPlugin.info = info;

  return VaastFixationPlugin;
})(jsPsychModule);
