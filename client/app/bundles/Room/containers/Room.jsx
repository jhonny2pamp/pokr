import PropTypes from 'prop-types'
import React from 'react'
import StatusBar from '../components/StatusBar'
import VoteBox from '../components/VoteBox'
import StoryListBox from '../components/StoryListBox'
import PeopleListBox from '../components/PeopleListBox'
import ActionBox from '../components/ActionBox'
import Board from '../components/Board'
import ActionCable from 'libs/actionCable'
import update from 'immutability-helper'
import Joyride from 'react-joyride'

export default class Room extends React.Component {
  rawMarkup() {
    const rawMarkup = marked(this.props.children.toString(), {sanitize: true});
    return { __html: rawMarkup };
  }

  constructor(props) {
    super(props)
    window.syncResult = (props.roomState == 'open') ? true : false
    ActionCable.setupChannelSubscription(props.roomId, props.roomState)

    this.state = {
      roomState: props.roomState,
      currentStoryId: props.currentStoryId,
      storyListUrl: props.storyListUrl,
      peopleListUrl: props.peopleListUrl,
      joyrideType: 'continuous',
      isReady: false,
      isRunning: false,
      steps: [],
      selector: '',
      autoStart: true,
      stepIndex: 1
    }
  }

  handleStorySwitch = (storyId) => {
    this.setState({
      roomState: "not-open",
      currentStoryId: storyId
    })
  }

  handleNoStoryLeft = () => {
    if (!this.roomClosed()) {
      $.ajax({
        url: `/rooms/${POKER.roomId}/set_room_status.json`,
        data: { status: 'draw' },
        method: 'post',
        dataType: 'json',
        cache: false,
        success: function(data) {
          // pass
        },
        error: function(xhr, status, err) {
          // pass
        }
      })

      let newState = update(this.state, {
        roomState: { $set: "draw" }
      })

      this.setState(newState)
    }
  }

  roomClosed = () => {
    return "draw" === this.state.roomState
  }

  addSteps = (steps) => {
    let newSteps = steps;

    if (!Array.isArray(newSteps)) {
      newSteps = [newSteps];
    }

    if (!newSteps.length) {
      return;
    }

    // Force setState to be synchronous to keep step order.
    this.setState(currentState => {
      currentState.steps = currentState.steps.concat(newSteps);
      return currentState;
    })
  }

  next() {
    this.joyride.next()
  }

  callback = (data) => {
    console.log('%ccallback', 'color: #47AAAC; font-weight: bold; font-size: 13px;'); //eslint-disable-line no-console
    console.log(data); //eslint-disable-line no-console

    this.setState({
      selector: data.type === 'tooltip:before' ? data.step.selector : '',
    });
  }

  playTourGuide = () => {
    let newState = update(this.state, {
      isReady: { $set: true },
      isRunning: { $set: true }
    })

    this.setState(newState)
  }

  render() {
    const {
      isReady,
      isRunning,
      joyrideType,
      selector,
      steps,
    } = this.state

    return (
      <div className="room" id="room">
        <Joyride
          ref={c => (this.joyride = c)}
          callback={this.callback}
          debug={false}
          disableOverlay={true}
          locale={{
            back: (<span>Back</span>),
            close: (<span>Close</span>),
            last: (<span>Last</span>),
            next: (<span>Next</span>),
            skip: (<span>Skip</span>),
          }}
          run={isRunning}
          showOverlay={true}
          showSkipButton={true}
          showStepsProgress={true}
          steps={steps}
          type={joyrideType}
          autoStart={true}
        />
        <StatusBar
          roomState={this.state.roomState}
          role={this.props.role}
          roomId={this.props.roomId}
          roomName={this.props.roomName}
          addSteps={this.addSteps}
          selector={selector}
          next={this.next}
          playTourGuide={this.playTourGuide}
        />
        <div className="row">
          <div id="operationArea" className="col-md-8">
            <VoteBox
              roomId={this.props.roomId}
              roomState={this.state.roomState}
              currentVote={this.props.currentVote}
              pointValues={this.props.pointValues}
              storyId={this.state.currentStoryId}
              addSteps={this.addSteps}
            />
            <StoryListBox
              roomId={this.props.roomId}
              onSwitchStory={this.handleStorySwitch}
              onNoStoryLeft={this.handleNoStoryLeft}
              roomState={this.state.roomState}
              storyId={this.state.currentStoryId}
              addSteps={this.addSteps}
            />
          </div>
          <div className="col-md-4">
            <PeopleListBox
              roomId={this.props.roomId}
              addSteps={this.addSteps}
          />
            <ActionBox
              roomState={this.state.roomState}
              role={this.props.role}
              roomId={this.props.roomId}
              storyId={this.state.currentStoryId}
              timerInterval={this.props.timerInterval}
              addSteps={this.addSteps}
            />
          </div>
        </div>
        {
          this.roomClosed() &&
            <Board roomId={this.props.roomId} roomState={this.state.roomState} />
        }
      </div>
    )
  }
}