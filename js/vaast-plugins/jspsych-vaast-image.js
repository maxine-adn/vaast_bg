var jsPsychVaastImage = (function(jspsych) {
  "use strict";

  const info = {
    name: "vaast-image",
    version: "1.0.0",
    parameters: {
      /** The image to be displayed. */
      stimulus: {
        type: jspsych.ParameterType.IMAGE,
        pretty_name: 'Stimulus',
        default: undefined,
      },
      /** The key press that is associated with an approach movement. */
      approach_key: {
        type: jspsych.ParameterType.KEY,
        pretty_name: 'Approach key',
        default: 'Z',
      },
      /** The key press that is associated with an avoidance movement. */
      avoidance_key: {
        type: jspsych.ParameterType.KEY,
        pretty_name: 'Avoidance key',
        default: 'S',
      },
      /** The keys that allow the user to advance to the next trial if their key press was incorrect. */
      key_to_move_forward: {
        type: jspsych.ParameterType.KEYS,
        pretty_name: 'Key to move forward',
        default: "ALL_KEYS",
      },
      /** If true, then the code included in 'html_when_wrong' will be displayed when the user makes an incorrect key press. */
      display_feedback: {
        type: jspsych.ParameterType.BOOL,
        pretty_name: 'Display feedback',
        default: false,
      },
      /** How long the feedback is shown (in ms). */
      feedback_duration: {
        type: jspsych.ParameterType.INTEGER,
        pretty_name: 'Feedback duration',
        default: null,
      },
      /** The html code that is displayed when a user presses the wrong key. */
      html_when_wrong: {
        type: jspsych.ParameterType.HTML_STRING,
        pretty_name: 'HTML when wrong',
        default: '<span style="color: red; font-size: 80px">X</span>',
      }, 
      /** If true, the user will be forced to press the correct key in order to advance to the next trial after a wrong key press. */
      force_correct_key_press: {
        type: jspsych.ParameterType.BOOL,
        pretty_name: 'Force correct key press',
        default: false,
      },
      /** The stimulus will be associated with either "approach" or "avoidance". */
      stim_movement: {
        type: jspsych.ParameterType.STRING,
        pretty_name: 'Stimulus movement association',
        options: ['approach', 'avoidance'],
        default: undefined,
      },
      /** An array with the sizes of the image as function of the position. */
      font_sizes: {
        type: jspsych.ParameterType.ARRAY,
        pretty_name: 'Stimulus size',
        default: null,
      },
      /** If true, the trial will end when the user makes a response. */
      response_ends_trial: {
        type: jspsych.ParameterType.BOOL,
        pretty_name: 'Response ends trial',
        default: true,
      },
      /** How long the trial is shown. */
      trial_duration: {
        type: jspsych.ParameterType.INTEGER,
        pretty_name: 'Trial duration',
        default: null,
      },
      /** An array with the images displayed as background as function of the position. */
      background_images: {
        type: jspsych.ParameterType.ARRAY,
        pretty_name: 'Background',
        default: undefined,
      },
      /** The position in the "background_images" array which will be used to set the background. */
      position: {
        type: jspsych.ParameterType.INT,
        pretty_name: 'Initial position',
        default: 3,
      }
    },
    data: {
      /** The path to the image file that the participant saw on this trial. */
      stimulus: {
        type: jspsych.ParameterType.STRING,
      },
      /** Indicates which key the participant pressed. */
      response: {
        type: jspsych.ParameterType.STRING,
      },
      /** Boolean indicating whether the user's key press was correct or incorrect for the given stimulus. */
      correct: {
        type: jspsych.ParameterType.BOOL,
      },
      /** The response time in milliseconds for the participant to make a response. The time is measured from when the stimulus first appears on the screen until the participant's response.  */
      rt: {
        type: jspsych.ParameterType.INT,
      },
      /** The movement associated with the stimulus. */
      movement: {
        type: jspsych.ParameterType.STRING,
      },
      /** The position in the "background_images" array used to set the background. */
      position: {
        type: jspsych.ParameterType.INT,
      },
    },
  }

/**
   * VAAST implementation in jsPsych. 
   * (image trial)
   *
   * {description}
   *
   * @author cedric.batailler@univ-grenoble-alpes.fr
   * 
   ****************************************/

  class VaastImagePlugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }
    trial(display_element, trial) {
      let html_str = "";

      html_str += "<div style='position: absolute; right: 0; top: 0; width: 100%; height: 100%; background: url(" + trial.background_images[trial.position] + ") center no-repeat'></div>";
      html_str += "<div style='position: absolute; right: 50%; top: 50; width: " + trial.font_sizes[trial.position] + "px; height: " + trial.font_sizes[trial.position] + "px; margin-top: -" + 
        (trial.font_sizes[trial.position]/2) + "px; margin-right: -" + (trial.font_sizes[trial.position]/2) + "px'><img height='" + trial.font_sizes[trial.position] + "' width='" + 
        trial.font_sizes[trial.position] + "' src='" + trial.stimulus + "' id='jspsych-vaast-stim'></img></div>";

      html_str += "<div id='wrongImgID' style='position: relative; top: 300px; margin-left: auto; margin-right: auto; left: 0; right: 0'>";

      if(trial.display_feedback === true) {
        html_str += "<div id='wrongImgContainer' style='visibility: hidden; position: absolute; top: -75px; margin-left: auto; margin-right: auto; left: 0; right: 0'><p>" + trial.html_when_wrong +
         "</p></div>";
      }

      html_str += "</div>";

      display_element.innerHTML = html_str;

      // store response
      var response = {
        rt: null,
        key: null,
        correct: false
      };

      // function to end trial when it is time
      const end_trial = () => {

        // kill keyboard listeners
        if (typeof keyboardListener !== 'undefined') {
          jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
        }

        // gather the data to store for the trial
        let trial_data = {
          "rt": response.rt,
          "stimulus": trial.stimulus,
          "key_press": response.key,
          "correct": response.correct,
          "movement": trial.stim_movement,
          "position": trial.position
        };

        // move on to the next trial
        jsPsych.finishTrial(trial_data);
      };

      // function to handle responses by the subject
      var after_response = function(info) {
        var wImg = document.getElementById("wrongImgContainer");
        // after a valid response, the stimulus will have the CSS class 'responded'
        // which can be used to provide visual feedback that a response was recorded
        display_element.querySelector('#jspsych-vaast-stim').className += ' responded';

        // only record the first response
        if (response.key == null ) {
          response = info;
        }

        if(trial.stim_movement == "avoidance") {
          if(response.rt !== null && jsPsych.pluginAPI.compareKeys(response.key, trial.avoidance_key)) {
            response.correct = true;
            if (trial.response_ends_trial) {
              end_trial();
            }
          } else {
            response.correct = false;
            if(!trial.response_ends_trial && trial.display_feedback == true) {
              wImg.style.visibility = "visible";
            }
            if(trial.response_ends_trial && trial.display_feedback == true && trial.feedback_duration !== null) {
              wImg.style.visibility = "visible";
              jsPsych.pluginAPI.setTimeout(function() {
                end_trial();
              }, trial.feedback_duration);
            }
            if(trial.response_ends_trial && trial.display_feedback == true && trial.feedback_duration == null) {
              wImg.style.visibility = "visible";
              if(trial.force_correct_key_press) {
                var keyListener = jsPsych.pluginAPI.getKeyboardResponse({
                  callback_function: end_trial,
                  valid_responses: [trial.avoidance_key]
                });
              } else {
              var keyListener = jsPsych.pluginAPI.getKeyboardResponse({
                callback_function: end_trial,
                valid_responses: trial.key_to_move_forward
              });}
             } else if(trial.response_ends_trial && trial.display_feedback != true) {
              end_trial();
            } else if(!trial.response_ends_trial && trial.display_feedback != true) {

            }
          }
        } else if(trial.stim_movement == "approach") {
          if(response.rt !== null && jsPsych.pluginAPI.compareKeys(response.key, trial.approach_key)) {
            response.correct = true;
            if (trial.response_ends_trial) {
              end_trial();
            }
          } else {
            response.correct = false;
            if(!trial.response_ends_trial && trial.display_feedback == true) {
              wImg.style.visibility = "visible";
            }
            if(trial.response_ends_trial && trial.display_feedback == true && trial.feedback_duration !== null) {
              wImg.style.visibility = "visible";
              jsPsych.pluginAPI.setTimeout(function() {
                end_trial();
              }, trial.feedback_duration);
            }
            if(trial.response_ends_trial && trial.display_feedback == true && trial.feedback_duration == null) {
              wImg.style.visibility = "visible";
              if(trial.force_correct_key_press) {
                var keyListener = jsPsych.pluginAPI.getKeyboardResponse({
                  callback_function: end_trial,
                  valid_responses: [trial.approach_key]
                });
              } else {
              var keyListener = jsPsych.pluginAPI.getKeyboardResponse({
                callback_function: end_trial,
                valid_responses: trial.key_to_move_forward
              });}
            } else if(trial.response_ends_trial && trial.display_feedback != true) {
              end_trial();
            } else if(!trial.response_ends_trial && trial.display_feedback != true) {

            }
          }
        }
      };

      // start the response listener
      if (trial.approach_key != "NO_KEYS" && trial.avoidance_key != "NO_KEYS") {
        var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
          callback_function: after_response,
          valid_responses: [trial.approach_key, trial.avoidance_key],
          rt_method: 'performance',
          persist: false,
          allow_held_key: false
        });
      }

      // end trial if time limit is set
      if (trial.trial_duration !== null && trial.response_ends_trial != true) {
        jsPsych.pluginAPI.setTimeout(function() {
          end_trial();
        }, trial.trial_duration);
      }
    }
  }
  VaastImagePlugin.info = info;

  return VaastImagePlugin;
})(jsPsychModule);
