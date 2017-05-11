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
      peopleListUrl: props.peopleListUrl
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

  render() {
    return (
      <div className="room" id="room">
        <div className="row">
          <StatusBar roomState={this.state.roomState} role={this.props.role} roomId={this.props.roomId} roomName={this.props.roomName} />
          <div id="operationArea" className="col-md-8">
            <VoteBox roomId={this.props.roomId} roomState={this.state.roomState} currentVote={this.props.currentVote} pointValues={this.props.pointValues} storyId={this.state.currentStoryId} />
            <StoryListBox onSwitchStory={this.handleStorySwitch} onNoStoryLeft={this.handleNoStoryLeft} url={this.props.storyListUrl} roomState={this.state.roomState} storyId={this.state.currentStoryId} />
          </div>

          <div className="col-md-4">
            <PeopleListBox url={this.props.peopleListUrl} />
            <ActionBox
              roomState={this.state.roomState}
              role={this.props.role}
              roomId={this.props.roomId}
              storyId={this.state.currentStoryId}
              timerInterval={this.props.timerInterval} />
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