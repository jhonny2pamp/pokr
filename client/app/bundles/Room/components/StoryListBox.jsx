import PropTypes from 'prop-types'
import React from 'react'
import StoryList from '../components/StoryList'
import EventEmitter from 'libs/eventEmitter'

export default class StoryListBox extends React.Component {

  state = {
    data: []
  }

  loadStoryListFromServer = () => {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: data => {
        if (data["ungroomed"].length) {
          let nextStoryId = data["ungroomed"][0]["id"]
          if (this.props.storyId !== nextStoryId) {
            this.handleStorySwitch(nextStoryId)
          }
        } else {
          this.handleNoStoryLeft()
        }
        this.setState({ data })
      },
      error: (xhr, status, err) => {
        console.error(this.props.url, status, err.toString());
      }
    });
  }

  handleStorySwitch = (storyId) => {
    this.props.onSwitchStory(storyId)
  }

  handleNoStoryLeft = () => {
    this.props.onNoStoryLeft()
  }

  componentDidMount() {
    this.loadStoryListFromServer();
    EventEmitter.subscribe("refreshStories", this.loadStoryListFromServer);
  }

  render() {
    return (
      <div className="panel panel-default">
        <div className="panel-heading">Stories</div>
        <div id="storyListArea" className="panel-body row">
          <ul className="nav nav-tabs" role="tablist">
            <li role="presentation" className="active">
              <a href="#grooming-list" aria-controls="home" role="tab" data-toggle="tab">Groom list</a>
            </li>
            <li role="presentation">
              <a href="#groomed-list" aria-controls="profile" role="tab" data-toggle="tab">Groomed list</a>
            </li>
          </ul>
          <div className="tab-content">
            <div role="tabpanel" className="row storyListBox tab-pane active" id="grooming-list">
              <StoryList data={this.state.data.ungroomed || []} tab="ungroomed" />
            </div>
            <div role="tabpanel" className="tab-pane" id="groomed-list">
              <StoryList data={this.state.data.groomed || []} tab="groomed" />
            </div>
          </div>
        </div>
      </div>
    )
  }
}