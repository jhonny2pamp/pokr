import PropTypes from 'prop-types';
import React from 'react';
import StatusBar from '../components/StatusBar';
import VoteBox from '../components/VoteBox';
import StoryListBox from '../components/StoryListBox';
import PeopleListBox from '../components/PeopleListBox';
import ActionBox from '../components/ActionBox';

export default class Room extends React.Component {
  rawMarkup() {
    const rawMarkup = marked(this.props.children.toString(), {sanitize: true});
    return { __html: rawMarkup };
  }

  constructor(props) {
    super(props)
    this.state = {
      roomState: props.roomState,
      syncResult: (props.roomState == 'open') ? true : false
    }
  }

  state = {
    storyListUrl: this.props.storyListUrl,
    peopleListUrl: this.props.peopleListUrl
  }

  // roomClosed = () => {
  //   POKER.roomState = "draw";
  //   drawBoard();
  // }

  // componentDidMount = () => {
  //   if (this.state.roomState === "draw") {
  //     EventEmitter.dispatch("roomClosed");
  //   } else {
  //     EventEmitter.subscribe("roomClosed", this.roomClosed);
  //   }
  // }

  render() {
    return (
      <div className="room" id="room">
        <div className="row">
          <StatusBar roomState={this.state.roomState} role={this.props.role} roomId={this.props.roomId} roomName={this.props.roomName} />
          <div id="operationArea" className="col-md-8">
            <VoteBox roomState={this.state.roomState} currentVote={this.props.currentVote} pointValues={this.props.pointValues} />
            <StoryListBox url={this.props.storyListUrl} />
          </div>

          <div className="col-md-4">
            <PeopleListBox url={this.props.peopleListUrl} />
            <ActionBox roomState={this.state.roomState} />
          </div>
        </div>
      </div>
    )
  }
}