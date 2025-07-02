// LICENCE -----------------------------------------------------------------------------
//
// Copyright 2018 - Cédric Batailler
//
// Permission is hereby granted, free of charge, to any person obtaining a copy of this
// software and associated documentation files (the "Software"), to deal in the Software
// without restriction, including without limitation the rights to use, copy, modify,
// merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to the following
// conditions:
//
// The above copyright notice and this permission notice shall be included in all copies
// or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
// PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
// CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE
// OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
// --------------------------------------------------------------------------------------

const browser_check = {
  type: jsPsychBrowserCheck,
  features : ["browser", "mobile"],
  inclusion_function: (data) => {
    return (data.browser === 'chrome' || data.browser === 'firefox') && data.mobile === false
  },
  exclusion_message: (data) => {
    if(data.mobile){
      return '<p>You must use a desktop/laptop computer to participate in this experiment.</p>';
    } else if (data.browser !== 'firefox' && data.browser !== 'chrome') {
      return '<p>Unfortunately, this study is not compatible with your browser.</p>' +
        '<p>Please reopen this experiment from a supported browser (like Chrome or Firefox).</p>'
    }
  }
};

var jsPsych = initJsPsych({
  on_interaction_data_update: function() {
    saving_browser_events(completion = false);
  },
  on_finish: function() {
    saving_browser_events(completion = true);
    window.location.href = "your-redirection-url";
  }
});

// Firebase initialization ---------------------------------------------------------------
firebase.initializeApp(firebase_config);
let database = firebase.database();
const session_id = jsPsych.randomization.randomID();

// Connection status ---------------------------------------------------------------------
// This section ensure that we don't lose data. Anytime the 
// client is disconnected, an alert appears onscreen
const connectedRef = firebase.database().ref(".info/connected");
const connection   = firebase.database().ref("connection/" + session_id + "/")
let dialog = undefined;
let first_connection = true;
connectedRef.on("value", function(snap) {
  if(snap.val() === true) {
    connection
      .push()
      .set({status: "connection",
            timestamp: firebase.database.ServerValue.TIMESTAMP})
    connection
      .push()
      .onDisconnect()
      .set({status: "disconnection",
            timestamp: firebase.database.ServerValue.TIMESTAMP})
  if(!first_connection) {
    dialog.modal('hide');
  }
  first_connection = false;
  } else {
    if(!first_connection) {
      dialog = bootbox.dialog({
        title: 'Connection lost',
        message: '<p class= "noConnection"><img class="spinner" src="/media/loading.gif" alt="loading gif"/> Please wait while we try to reconnect.</p>',
        closeButton: false
      });
    }
  }
});
  
// Global variables:
const approach_key  = "T";
const avoidance_key = "B";
  
// Cursor helper functions -------------------------------------------------------------
const hiding_cursor = {
  type: jsPsychCallFunction,
  func: function() {
    document.body.style.cursor= "none";
  }
}
  
const showing_cursor = {
  type: jsPsychCallFunction,
  func: function() {
    document.body.style.cursor= "auto";
  }
}
  
// VAAST --------------------------------------------------------------------------------
// Variables used to define the experimental conditions
const vaast_cond_block_1 = jsPsych.randomization.sampleWithoutReplacement(["app_pos", "app_neg"], 1)[0];
const vaast_cond_block_2 = vaast_cond_block_1 === "app_pos" ? "app_neg" : "app_pos";

// VAAST variables ----------------------------------------------------------------------
const vaast_conditions = {
  app_pos: {
    move_pos: "approach",
    move_neg: "avoidance",
    stim_to_approach: "positive words",
    stim_to_avoid: "negative words"
  },
  app_neg: {
    move_pos: "avoidance",
    move_neg: "approach",
    stim_to_approach: "negative words",
    stim_to_avoid: "positive words"
  }
};

const cond1 = vaast_conditions[vaast_cond_block_1];
const cond2 = vaast_conditions[vaast_cond_block_2];

const move_pos_1 = cond1.move_pos;
const move_neg_1 = cond1.move_neg;
const stim_to_approach_1 = cond1.stim_to_approach;
const stim_to_avoid_1 = cond1.stim_to_avoid;
  
const move_pos_2 = cond2.move_pos;
const move_neg_2 = cond2.move_neg;
const stim_to_approach_2 = cond2.stim_to_approach;
const stim_to_avoid_2 = cond2.stim_to_avoid;  

// VAAST background images --------------------------------------------------------------
/*
const background = [
  "background/2.jpg",
  "background/4.jpg",
  "background/6.jpg"
];
*/
const background_env_eco = [
 "background/env_eco/2.jpg",
 "background/env_eco/4.jpg",
 "background/env_eco/6.jpg"
];

const background_fv_eco = [
  "background/fv_eco/2.jpg",
  "background/fv_eco/4.jpg",
  "background/fv_eco/6.jpg"
];

let background = jsPsych.data.getURLVariable('background');
if(background == null) {background = jsPsych.randomization.sampleWithoutReplacement([background_env_eco, background_fv_eco], 1)[0];}

//let background = jsPsych.randomization.sampleWithoutReplacement([background_env_eco, background_fv_eco], 1)[0];

bg_preview = background == background_env_eco ? "media/vaast-background_env_eco.jpg" : "media/vaast-background_fv_eco.jpg";

// prolific variables
let prolific_id = jsPsych.data.getURLVariable('PROLIFIC_PID');
if(prolific_id == null) 
  prolific_id = jsPsych.randomization.randomID();

// VAAST stimuli ------------------------------------------------------------------------
const vaast_stim_training_block_1_words = [
  {stimulus: 'courage',     category: "pos", movement: move_pos_1},
/** {stimulus: 'greatness',   category: "pos", movement: move_pos_1},
  {stimulus: 'wildlife',    category: "pos", movement: move_pos_1},
  {stimulus: 'poverty',     category: "neg", movement: move_neg_1},
  {stimulus: 'amputation',  category: "neg", movement: move_neg_1},
  {stimulus: 'homicide',    category: "neg", movement: move_neg_1}, */
];

const vaast_stim_block_1_words = [
  {stimulus: 'accomplishment',  category: "pos",  movement: move_pos_1},
/* {stimulus: 'comedy',          category: "pos",  movement: move_pos_1},
  {stimulus: 'compassion',      category: "pos",  movement: move_pos_1},
  {stimulus: 'delight',         category: "pos",  movement: move_pos_1},
  {stimulus: 'enjoyment',       category: "pos",  movement: move_pos_1},
  {stimulus: 'excellence',      category: "pos",  movement: move_pos_1},
  {stimulus: 'friendship',      category: "pos",  movement: move_pos_1},
  {stimulus: 'happiness',       category: "pos",  movement: move_pos_1},
  {stimulus: 'harmony',         category: "pos",  movement: move_pos_1},
  {stimulus: 'honeymoon',       category: "pos",  movement: move_pos_1},
  {stimulus: 'hug',             category: "pos",  movement: move_pos_1},
  {stimulus: 'humor',           category: "pos",  movement: move_pos_1},
  {stimulus: 'kindness',        category: "pos",  movement: move_pos_1},
  {stimulus: 'laughter',        category: "pos",  movement: move_pos_1},
  {stimulus: 'liberty',         category: "pos",  movement: move_pos_1},
  {stimulus: 'relaxation',      category: "pos",  movement: move_pos_1},
  {stimulus: 'sincerity',       category: "pos",  movement: move_pos_1},
  {stimulus: 'sunshine',        category: "pos",  movement: move_pos_1},
  {stimulus: 'tranquility',     category: "pos",  movement: move_pos_1},
  {stimulus: 'victory',         category: "pos",  movement: move_pos_1},
  {stimulus: 'alcoholism',      category: "neg",  movement: move_neg_1},
  {stimulus: 'assassination',   category: "neg",  movement: move_neg_1},
  {stimulus: 'cancer',          category: "neg",  movement: move_neg_1},
  {stimulus: 'coma',            category: "neg",  movement: move_neg_1},
  {stimulus: 'coward',          category: "neg",  movement: move_neg_1},
  {stimulus: 'debt',            category: "neg",  movement: move_neg_1},
  {stimulus: 'disaster',        category: "neg",  movement: move_neg_1},
  {stimulus: 'discrimination',  category: "neg",  movement: move_neg_1},
  {stimulus: 'disease',         category: "neg",  movement: move_neg_1},
  {stimulus: 'grief',           category: "neg",  movement: move_neg_1},
  {stimulus: 'guilt',           category: "neg",  movement: move_neg_1},
  {stimulus: 'illness',         category: "neg",  movement: move_neg_1},
  {stimulus: 'injustice',       category: "neg",  movement: move_neg_1},
  {stimulus: 'loneliness',      category: "neg",  movement: move_neg_1},
  {stimulus: 'massacre',        category: "neg",  movement: move_neg_1},
  {stimulus: 'morgue',          category: "neg",  movement: move_neg_1},
  {stimulus: 'nightmare',       category: "neg",  movement: move_neg_1},
  {stimulus: 'pollution',       category: "neg",  movement: move_neg_1},
  {stimulus: 'slavery',         category: "neg",  movement: move_neg_1},
  {stimulus: 'toxicity',        category: "neg",  movement: move_neg_1}, */
];

const vaast_stim_training_block_2_words = [
  {stimulus: 'courage',     category: "pos", movement: move_pos_2},
/*  {stimulus: 'greatness',   category: "pos", movement: move_pos_2},
  {stimulus: 'wildlife',    category: "pos", movement: move_pos_2},
  {stimulus: 'poverty',     category: "neg", movement: move_neg_2},
  {stimulus: 'amputation',  category: "neg", movement: move_neg_2},
  {stimulus: 'homicide',    category: "neg", movement: move_neg_2}, */
];

const vaast_stim_block_2_words = [
  {stimulus: 'accomplishment',  category: "pos",  movement: move_pos_2},
/* {stimulus: 'comedy',          category: "pos",  movement: move_pos_2},
  {stimulus: 'compassion',      category: "pos",  movement: move_pos_2},
  {stimulus: 'delight',         category: "pos",  movement: move_pos_2},
  {stimulus: 'enjoyment',       category: "pos",  movement: move_pos_2},
  {stimulus: 'excellence',      category: "pos",  movement: move_pos_2},
  {stimulus: 'friendship',      category: "pos",  movement: move_pos_2},
  {stimulus: 'happiness',       category: "pos",  movement: move_pos_2},
  {stimulus: 'harmony',         category: "pos",  movement: move_pos_2},
  {stimulus: 'honeymoon',       category: "pos",  movement: move_pos_2},
  {stimulus: 'hug',             category: "pos",  movement: move_pos_2},
  {stimulus: 'humor',           category: "pos",  movement: move_pos_2},
  {stimulus: 'kindness',        category: "pos",  movement: move_pos_2},
  {stimulus: 'laughter',        category: "pos",  movement: move_pos_2},
  {stimulus: 'liberty',         category: "pos",  movement: move_pos_2},
  {stimulus: 'relaxation',      category: "pos",  movement: move_pos_2},
  {stimulus: 'sincerity',       category: "pos",  movement: move_pos_2},
  {stimulus: 'sunshine',        category: "pos",  movement: move_pos_2},
  {stimulus: 'tranquility',     category: "pos",  movement: move_pos_2},
  {stimulus: 'victory',         category: "pos",  movement: move_pos_2},
  {stimulus: 'alcoholism',      category: "neg",  movement: move_neg_2},
  {stimulus: 'assassination',   category: "neg",  movement: move_neg_2},
  {stimulus: 'cancer',          category: "neg",  movement: move_neg_2},
  {stimulus: 'coma',            category: "neg",  movement: move_neg_2},
  {stimulus: 'coward',          category: "neg",  movement: move_neg_2},
  {stimulus: 'debt',            category: "neg",  movement: move_neg_2},
  {stimulus: 'disaster',        category: "neg",  movement: move_neg_2},
  {stimulus: 'discrimination',  category: "neg",  movement: move_neg_2},
  {stimulus: 'disease',         category: "neg",  movement: move_neg_2},
  {stimulus: 'grief',           category: "neg",  movement: move_neg_2},
  {stimulus: 'guilt',           category: "neg",  movement: move_neg_2},
  {stimulus: 'illness',         category: "neg",  movement: move_neg_2},
  {stimulus: 'injustice',       category: "neg",  movement: move_neg_2},
  {stimulus: 'loneliness',      category: "neg",  movement: move_neg_2},
  {stimulus: 'massacre',        category: "neg",  movement: move_neg_2},
  {stimulus: 'morgue',          category: "neg",  movement: move_neg_2},
  {stimulus: 'nightmare',       category: "neg",  movement: move_neg_2},
  {stimulus: 'pollution',       category: "neg",  movement: move_neg_2},
  {stimulus: 'slavery',         category: "neg",  movement: move_neg_2},
  {stimulus: 'toxicity',        category: "neg",  movement: move_neg_2},*/
];

// VAAST stimuli sizes -------------------------------------------------------------------
const word_sizes = [
  38,
  46,
  60
];

const resize_factor = 7;
const image_sizes = word_sizes.map(function(x) { return x * resize_factor; });

// Helper function ---------------------------------------------------------------------
// next_position():
// Computes next position as function of current position and correct movement. Because
// participant have to press the correct response key, it always shows the correct
// position.
const next_position = function() {
  const current_position = jsPsych.data.getLastTrialData().values()[0].position;
  const current_response = jsPsych.data.getLastTrialData().values()[0].key_press;
  let position = current_position;

  if(jsPsych.pluginAPI.compareKeys(current_response, approach_key)) {
    position = position + 1;
  }

  if(jsPsych.pluginAPI.compareKeys(current_response, avoidance_key)) {
    position = position - 1;
  }

  return(position)
}
  
// Preloading
// In principle, it should have ended when participants starts VAAST procedure (which)
// contains most of the images that have to be pre-loaded.
 
const all_backgrounds = [
"media/loading.gif", 
"media/vaast-background_env_eco.jpg", 
"media/vaast-background_fv_eco.jpg", 
"media/keyboard-vaast-tgb3.png",
"background/env_eco/2.jpg",
"background/env_eco/4.jpg",
"background/env_eco/6.jpg",
"background/fv_eco/2.jpg",
"background/fv_eco/4.jpg",
"background/fv_eco/6.jpg"
];

const preload = {
  type: jsPsychPreload,
  images: all_backgrounds};

// Saving blocks ------------------------------------------------------------------------
// Every function here sends the data to keen.io. Because data sent is different according
// to trial type, there are different function definitions.
  
// Init ---------------------------------------------------------------------------------
const saving_id = function() {
  database
      .ref("participant_id_fondVAAST/")
      .push()
      .set({session_id: session_id,
        prolific_id: prolific_id,
        background: background,
        timestamp: firebase.database.ServerValue.TIMESTAMP,
        vaast_cond_block_1: vaast_cond_block_1,
        vaast_cond_block_2: vaast_cond_block_2
      })
}

// Vaast trial --------------------------------------------------------------------------
const saving_vaast_trial = function() {
  database
    .ref("vaast_trial_fondVAAST/")
    .push()
    .set({session_id: session_id,
      prolific_id: prolific_id,
      background: background,
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      vaast_cond_block_1: vaast_cond_block_1,
      vaast_cond_block_2: vaast_cond_block_2,
      vaast_trial_data: jsPsych.data.get().last(4).json()
    })
  }

const saving_extra = function() {
	database
	  .ref("extra_info_fondVAAST/")
    .push()
	  .set({session_id: session_id,
	 	  prolific_id: prolific_id,
	 	  background: background,
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      vaast_cond_block_1: vaast_cond_block_1,
      vaast_cond_block_2: vaast_cond_block_2,
      extra_data: jsPsych.data.get().last(6).json(),
    })
}

const saving_browser_events = function(completion) {
	database
	  .ref("browser_event_fondVAAST/")
    .push()
	  .set({session_id: session_id,
	  	prolific_id: prolific_id,
	  	background: background,
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      vaast_cond_block_1: vaast_cond_block_1,
      vaast_cond_block_2: vaast_cond_block_2,
      completion: completion,
      event_data: jsPsych.data.getInteractionData().json()
    })
}

// Attentional check logging ------------------------------------------------------------
const saving_attention = function() {
  database
    .ref("attention_info_fondVAAST/")
    .push()
    .set({session_id: session_id,
      prolific_id: prolific_id,
      background: background,
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      attention_data: jsPsych.data.get().last(1).json(),
    })
}

// Saving blocks ------------------------------------------------------------------------
const save_id = {
  type: jsPsychCallFunction,
  func: saving_id
}

const save_vaast_trial = {
  type: jsPsychCallFunction,
  func: saving_vaast_trial
}

const save_attention = {
  type: jsPsychCallFunction,
  func: saving_attention
}

const save_extra = {
  type: jsPsychCallFunction,
  func: saving_extra
}

// EXPERIMENT ---------------------------------------------------------------------------

// Initial instructions -----------------------------------------------------------------
const welcome = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus:
    "<h1 class ='custom-title'> Welcome </h1>" +
    "<p class='instructions'>Thank you for taking part in this study.<p>" +
    "<p class='instructions'>During this study, you will have to complete a categorization task. We " +
    " will record your performance on this task but " +
    "we will not collect any personally identifying information.</p>" +
    "<p class='instructions'>Because we rely on third party services to gather data, ad-blocking " +
    "softwares might interfere with data collection. Therefore, please  " +
    "disable your ad-blocking software during this study. " +
    "<b>If we are unable to record your data, we will not be able to reward you for " +
    "your participation</b>. </p>" +
    "<p class='instructions'>If you have any question related to this research, please " +
    "send a message on Prolific. </p>" +
    "<p class = 'continue-instructions'>Press <strong>space</strong> to start the study.</p>",
  choices: [' ']
};

const consent = {
  type: jsPsychHtmlButtonResponse,
  stimulus:
  "<h1 class ='custom-title'> Informed consent </h1>" +
    "<p class='instructions'>By clicking below to start the study, you recognize that:</p>" +
      "<ul class='instructions'>" +
        "<li>You know you can stop your participation at any time, without having to justify yourself. " +
        "However, keep in mind that you have to complete the whole study in order to be paid.</li>" +
        "<li>You know you can contact our team for any questions or dissatisfaction related to your " +
        "participation in the research via Prolific.</li>" +
        "<li>You know the data collected will be strictly confidential and it will be impossible for " +
        "any unauthorized third party to identify you.</li>" +
      "</ul>" +
    "<p class='instructions'>By clicking on the \"I confirm\" button, you give your free and informed consent to participate " +
    "in this research.</p>",
  choices: ['I confirm']
}

const welcome_2 = {
  type: jsPsychHtmlButtonResponse,
  stimulus:
    "<p class='instructions'>Before going further, please note that this study should take " +
    "15-17 minutes to complete.</p>",
  choices: ['I have enough time', 'I do not have enough time'],
};

const not_enough_time_to_complete = {
  type: jsPsychHtmlButtonResponse,
  stimulus: '<p>Please come back later to take part in this experiment.</p>',
  choices: ['Go back to Prolific Academic'],
};

const redirect_to_prolific = {
  type: jsPsychCallFunction,
  func: function() {
    window.location.href = "https://www.prolific.ac/";
    jsPsych.pauseExperiment();
  }
}

const if_not_enough_time = {
  timeline: [not_enough_time_to_complete, redirect_to_prolific],
  conditional_function: function() {
    // get the data from the previous trial,
    // and check which key was pressed
    let trial_data = jsPsych.data.getLastTrialData().values()[0].response;
    if(trial_data == 1){ // participant says they don't have enough time
      return true;
    } else { // participant says they have enough time
      return false;
    }
  }
}

// Switching to fullscreen --------------------------------------------------------------
const fullscreen_trial = {
  type: jsPsychFullscreen,
  message:  '<p>To take part in this study, your browser needs to be set to fullscreen.</p>',
  button_label: 'Switch to fullscreen',
  fullscreen_mode: true
}

// First slide --------------------------------------------------------------------------
const instructions = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: "<p class='instructions'>You are now about to start the study. "+
    "<br><br>"+
    "In this study, you will engage in a categorization task divided into two sections. </p>" +
    "<p class='instructions'>Note that your complete attention is critical for this task " +
    "(to ensure this, we may have added attentional check during the experiment)." +
    "<br>Note also that we monitor the time spent during the experiment and that " +
    "we will not accept submission for which the time to complete the study is unrealistic " +
    "or for which the attentional check is not successfully completed.</p>" +
    "<p class = 'continue-instructions'>Press <strong>space</strong> to start.</p>",
  choices: [' ']
};

// VAAST instructions -------------------------------------------------------------------
const vaast_instructions_1 = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus:
    "<h1 class ='custom-title'>Video Game Task</h1>" +
    "<p class='instructions'>In this task, like in a video game, you will see an environment " +
    "(presented below) in which you will be able to move forward or backward.</p>" +
    "<p class='instructions'></p>" +
      "<img src = '" + bg_preview + "'>" +
    "<br><br>" +
    "<p class = 'continue-instructions'>Press <strong>space</strong> to continue.</p>",
  choices: [' ']
};

const attention_check = {
  type: jsPsychSurveyText,
  data: {trial: "attention_check"},
  preamble: "<p class ='instructions'>When asked for your favorite color, please enter the word baguette in the box below.</p>",
  questions: [{
    prompt: "<p class='instructions'>Based on the text above, what is your favorite color?</p>"
  }],
  button_label: "Submit",
};

const vaast_instructions_2 = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus:
    "<h1 class ='custom-title'>Video Game Task</h1>" +
    "<p class='instructions'>Words will appear in this environment and your task " +
    "will be to move forward or backward as a function of the type of word (more specific instructions following).</p>" +
    "<p class='instructions'> To move forward or backward, you will use the following keys of your keyboard:</p>" +
    "<p class='instructions'></p>" +
      "<img src = 'media/keyboard-vaast-tgb3.png'/>" +
    "<br><br>" +
    "<p class = 'continue-instructions'>Press <strong>space</strong> to continue.</p>",
  choices: [' ']
};

const vaast_instructions_3 = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus:
    "<h1 class ='custom-title'>Video Game Task</h1>" +
    "<p class='instructions'>At the beginning of each trial, you will see the 'O' symbol. " +
    "This symbol indicates that you have to press the <b>START key</b> (namely the <b>G key</b>) to start the trial.</p>" +
    "<p class='instructions'>Then, you will see a fixation cross (+) at the center of the screen, followed by a word.</p>" +
    "<p class='instructions'>Your task is to move forward or backward by pressing the <b>MOVE FORWARD</b> " +
    "(the <b>T key</b>) or the <b>MOVE BACKWARD</b> (the <b>B key</b>) key <strong>as fast as possible</strong>.</p>" +
    "<p class='instructions'>For all of these actions, please only use the index of your dominant hand.</p>" +
    "<p class='continue-instructions'>Press <strong>space</strong> to start the task.</p>",
  choices: [' ']
};

const vaast_instructions_training_block_1 = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus:
    "<h1 class ='custom-title'>Video Game Task: Section 1</h1>" +
    "<p class='instructions'><center><strong>INSTRUCTION FOR THIS FIRST SECTION</strong></center></p>" +
    "<p class='instructions'>In this section, you have to:</p>" +
     "<ul class='instructions'>" +
      "<li><strong>APPROACH " + stim_to_approach_1 + " by pressing the MOVE FORWARD key <br>(i.e., the " + approach_key + " key)</strong></li>" +
      "<li><strong>AVOID " + stim_to_avoid_1 + " by pressing the MOVE BACKWARD key <br>(i.e., the " + avoidance_key + " key)</strong></li>" +
     "</ul>" +
    "<p class='instructions'>You will start with a training phase.</p>" +
    "<p class='instructions'><u>WARNING:</u> we will report your errors ONLY during the training phase, " +
    "so it is important that you read carefully and memorize the instructions above.</p>" +
    "<p class='continue-instructions'>Press <strong>space</strong> to continue.</p>",
  choices: [' ']
};

const vaast_instructions_test_block_1 = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus:
    "<h1 class ='custom-title'>Video Game Task: Section 1</h1>" +
    "<p class='instructions'>The training phase is now over.</p>" +
    "<p class='instructions'><u>WARNING:</u> you will no longer have a message to report your errors.</p>" +
    "<p class='instructions'>As a reminder, you have to:</p>" +
      "<ul class='instructions'>" +
        "<li><strong>APPROACH " + stim_to_approach_1 + " by pressing the MOVE FORWARD key <br>(i.e., the " + approach_key + " key)</strong></li>" +
        "<li><strong>AVOID " + stim_to_avoid_1 + " by pressing the MOVE BACKWARD key <br>(i.e., the " + avoidance_key + " key)</strong></li>" +
      "</ul>" +
    "<p class='continue-instructions'>Press <strong>space</strong> to continue.</p>",
  choices: [' ']
};

const vaast_instructions_training_block_2 = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus:
    "<h1 class ='custom-title'>Video Game Task: Section 2</h1>" +
    "<p class='instructions'><center><strong>INSTRUCTION FOR THIS SECOND SECTION</strong></center></p>" +
    "<p class='instructions'>In this section, you have to:</p>" +
      "<ul class='instructions'>" +
        "<li><strong>APPROACH " + stim_to_approach_2 + " by pressing the MOVE FORWARD key <br>(i.e., the " + approach_key + " key)</strong></li>" +
        "<li><strong>AVOID " + stim_to_avoid_2 + " by pressing the MOVE BACKWARD key <br>(i.e., the " + avoidance_key + " key)</strong></li>" +
      "</ul>" +
    "<p class='instructions'>You will start with a training phase.</p>" +
    "<p class='instructions'><u>WARNING:</u> we will report your errors ONLY during the training phase, " +
    "so it is important that you read carefully and memorize the instructions above.</p>" +
    "<p class='continue-instructions'>Press <strong>space</strong> to continue.</p>",
  choices: [' ']
};

const vaast_instructions_test_block_2 = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus:
    "<h1 class ='custom-title'>Video Game Task: Section 2</h1>" +
    "<p class='instructions'>The training phase is now over.</p>" +
    "<p class='instructions'><u>WARNING:</u> you will no longer have a message to report your errors.</p>" +
    "<p class='instructions'>As a reminder, you have to:</p>" +
      "<ul class='instructions'>" +
        "<li><strong>APPROACH " + stim_to_approach_2 + " by pressing the MOVE FORWARD key <br>(i.e., the " + approach_key + " key)</strong></li>" +
        "<li><strong>AVOID " + stim_to_avoid_2 + " by pressing the MOVE BACKWARD key <br>(i.e., the " + avoidance_key + " key)</strong></li>" +
      "</ul>" +
    "<p class='continue-instructions'>Press <strong>space</strong> to continue.</p>",
  choices: [' ']
};

const vaast_instructions_4 = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus:
    "<p class='instructions'><center>Before you start:</center></p>" +
    "<p class='instructions'>Remember that it is EXTREMELY IMPORTANT that you try to " +
    "respond as fast and as correctly as possible.</p>" +
    "<br>" +
    "<p class='continue-instructions'>Press <strong>space</strong> to continue.</p>",
  choices: [' ']
}

const vaast_instructions_5 = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus:
    "<p class='instructions'><center><strong>End of this section</strong></center></p>" +
    "<br>" +
    "<p class = 'continue-instructions'><center>Press <strong>space</strong> to continue.</center></p>",
  choices: [' ']
};


// VAAST trials ---------------------------------------------------------------------
const vaast_start = {
  type: jsPsychVaastText,
  stimulus: "o",
  position: 1,
  background_images: background,
  font_sizes:  word_sizes,
  approach_key: "g",
  stim_movement: "approach",
  html_when_wrong: '<span style="color: red; font-size: 80px">&times;</span>',
  force_correct_key_press: true,
  display_feedback: true,
  response_ends_trial: true
}

const vaast_fixation = {
  type: jsPsychVaastFixation,
  fixation: "+",
  font_size: 46,
  position: 1,
  background_images: background
}

const vaast_first_step_train = {
  type: jsPsychVaastText,
  stimulus: jsPsych.timelineVariable('stimulus'),
  position: 1,
  background_images: background,
  font_sizes: word_sizes,
  stim_movement: jsPsych.timelineVariable('movement'),
  approach_key:  approach_key,
  avoidance_key: avoidance_key,
  html_when_wrong: '<span style="color: red; font-size: 80px">&times;</span>',
  force_correct_key_press: false,
  display_feedback: true,
  feedback_duration: 500, 
  response_ends_trial: true
}

const vaast_first_step = {
  type: jsPsychVaastText,
  stimulus: jsPsych.timelineVariable('stimulus'),
  position: 1,
  background_images: background,
  font_sizes: word_sizes,
  stim_movement: jsPsych.timelineVariable('movement'),
  approach_key:  approach_key,
  avoidance_key: avoidance_key,
  html_when_wrong: '<span style="color: red; font-size: 80px">&times;</span>',
  force_correct_key_press: false,
  display_feedback: false,
  response_ends_trial: true
}

const vaast_second_step = {
  type: jsPsychVaastText,
  position: next_position,
  stimulus: jsPsych.timelineVariable('stimulus'),
  background_images: background,
  font_sizes: word_sizes,
  stim_movement: jsPsych.timelineVariable('movement'),
  response_ends_trial: false,
  trial_duration: 500
}

const vaast_second_step_train = {
  timeline: [vaast_second_step],
  conditional_function: function() {
    let trial_data = jsPsych.data.getLastTrialData().values()[0];
    return trial_data.correct;
  }
}

// VAAST blocks ---------------------------------------------------------------------
const vaast_training_block_1 = {
  timeline: [
  	vaast_start, 
  	vaast_fixation, 
  	vaast_first_step_train, 
  	vaast_second_step_train, 
  	save_vaast_trial
  ],
  timeline_variables: vaast_stim_training_block_1_words,
  repetitions: 1,
  randomize_order: true
};

const vaast_test_block_1 = {
  timeline: [
  	vaast_start, 
  	vaast_fixation, 
  	vaast_first_step, 
  	vaast_second_step, 
  	save_vaast_trial
  ],
  timeline_variables: vaast_stim_block_1_words,
  repetitions: 1,
  randomize_order: true
};

const vaast_training_block_2 = {
  timeline: [
  	vaast_start, 
  	vaast_fixation, 
  	vaast_first_step_train, 
  	vaast_second_step_train, 
  	save_vaast_trial
  ],
  timeline_variables: vaast_stim_training_block_2_words,
  repetitions: 1,
  randomize_order: true
};

const vaast_test_block_2 = {
  timeline: [
  	vaast_start, 
  	vaast_fixation, 
  	vaast_first_step, 
  	vaast_second_step, 
  	save_vaast_trial
  ],
  timeline_variables: vaast_stim_block_2_words,
  repetitions: 1,
  randomize_order: true
};

// End fullscreen -----------------------------------------------------------------------

const fullscreen_trial_exit = {
  type: jsPsychFullscreen,
  fullscreen_mode: false
}

// Demographic questions -------------------------------------------------------------

const extra_information = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus:
    "<p class='instructions'>The study is almost finished. Now, you have to answer a few questions.</p>" +
    "<p class='continue-instructions'>Press <strong>space</strong> to continue.</p>",
  choices: [' ']
};

const extra_information_2 = {
  timeline: [{
    type: jsPsychSurveyText,
    questions: [{prompt: "How old are you?",
                 required: true,
                 name: "age"}],
    button_label: "Submit",
  }],
  loop_function: function() {
    let trial_data = jsPsych.data.getLastTrialData().values()[0];
    let age = "";

    if (trial_data.response && trial_data.response.age !== undefined && trial_data.response.age !== null) {
      age = trial_data.response.age.trim();
    }

    // Checks whether the given answer is a number or not (if not, asks to answer again)
    if (!/^\d+$/.test(age) || parseInt(age) < 1) {
      alert("Please enter your age as a number (e.g., 25).");
      return true; // asks again
    }
    return false;
  }
}

const extra_information_3 = {
  type: jsPsychSurveyMultiChoice,
  questions: [{prompt: "What is your sex?", 
               options: ["&nbspMale", "&nbspFemale", "&nbspOther"], 
               required: true, horizontal: true, 
               name: "sex"}],
  button_label: "Submit"
}

const extra_information_4 = {
  type: jsPsychSurveyMultiChoice,
  questions: [{prompt: "How well do you speak English?",
               options: ["&nbspFluently", "&nbspVery well", "&nbspWell", "&nbspAverage", "&nbspBadly", "&nbspVery badly"],
               required: true, horizontal: false,
               name: "fluency"}],
  button_label: "Submit"
}

const extra_information_5 = {
  type: jsPsychSurveyMultiChoice,
  questions: [{prompt: "What is your socioeconomic status?",
               options: ["&nbspVery low", "&nbspLow", "&nbspMedium", "&nbspHigh", "&nbspVery high"],
               required: true, horizontal: false, 
               name: "socioeconomic status"}],
  button_label: "Submit"
}

const extra_information_6 = {
  type: jsPsychSurveyMultiChoice,
  questions: [{prompt: "What is your highest level of education?",
               options: ["&nbspDid not complete high school", "&nbspHigh school/GED", "&nbspSome college", "&nbspBachelor's degree", "&nbspMaster's degree", "&nbspAdvanced graduate work or Ph.D."],
               required: true, horizontal: false, 
               name: "education"}],
  button_label: "Submit"
}

const extra_information_7 = {
  type: jsPsychSurveyText,
  questions: [{prompt: "Do you have any remarks about this study? [Optional]",
               name: "remarks"}],
  button_label: "Submit"
}

// End instructions ---------------------------------------------------------------------

const ending = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus:
    "<p class='instructions'>You are now finished with this study.<p>" +
    "<p class='instructions'>In this study, we were interested in the measure of " +
    "approach and avoidance tendencies. Research show that individuals are generally " +
    "faster to approach positive stimuli and to avoid negative stimuli (rather than the reverse). </p>" +
    "<p class='instructions'> Here, we wanted to see if this effect was larger for one visual environment " +
    "compared to the other. </p>" +
    "<p class='instructions'>For more information on this topic, please send a message on Prolific. </p>" +
    "<p class = 'continue-instructions'>Press <strong>space</strong> to continue.</p>",
  choices: [' ']
};

const ending_2 = {
  type: jsPsychHtmlKeyboardResponse,
  trial_duration: 2000,
  stimulus:
    "<p class='instructions'>You will now be redirected to Prolific Academic's website within seconds.<p>" +
    "<p class='instructions'>If you are not redirected, please click <a href='https://app.prolific.ac/submissions/complete?cc=MEMHX5XQ'>here</a>.<p>",
  choices: "NO_KEYS"
};

// Procedure ----------------------------------------------------------------------------
// Initialize timeline ------------------------------------------------------------------
  
const timeline = [];

timeline.push(browser_check,
              preload);

timeline.push(welcome,
              consent,
              welcome_2,
              if_not_enough_time);

// prolific verification
timeline.push(save_id);

// fullscreen
timeline.push(fullscreen_trial);

// initial instructions
timeline.push(instructions);

// vaast - instructions
timeline.push(vaast_instructions_1,
              vaast_instructions_2,
              vaast_instructions_3,
              attention_check,
              save_attention,
              hiding_cursor);

// vaast - blocks
timeline.push(vaast_instructions_training_block_1,
              vaast_instructions_4,
              vaast_training_block_1,
              vaast_instructions_test_block_1,
              vaast_test_block_1,
              vaast_instructions_5,
              vaast_instructions_training_block_2,
              vaast_instructions_4,
              vaast_training_block_2,
              vaast_instructions_test_block_2,
              vaast_test_block_2,
              vaast_instructions_5);

// vaast - end
timeline.push(fullscreen_trial_exit,
              showing_cursor); 

// demographic questions
timeline.push(extra_information,
              extra_information_2,
              extra_information_3,
              extra_information_4,
              extra_information_5,
              extra_information_6,
              extra_information_7,
              save_extra);

// ending
timeline.push(ending,
              ending_2);

// Launch experiment --------------------------------------------------------------------
jsPsych.run(timeline);