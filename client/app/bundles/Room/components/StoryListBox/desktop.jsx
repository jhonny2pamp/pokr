import PropTypes from 'prop-types'
import React from 'react'
import StoryList from '../StoryList'
import EventEmitter from 'libs/eventEmitter'
import {defaultTourColor} from 'libs/barColors'

import css from './index.scss'

export default class StoryListBox extends React.Component {

  state = {
    data: []
  }

  loadStoryListFromServer = () => {
    $.ajax({
      url: `/rooms/${this.props.roomId}/story_list.json`,
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
        console.error("Fetching story list", status, err.toString());
      }
    });
  }

  handleStorySwitch = (storyId) => {
    this.props.onSwitchStory(storyId)
  }

  handleNoStoryLeft = () => {
    this.props.onNoStoryLeft()
  }

  sync = () => {
    if(isElectron()) {
      window.Bridge.updateIssue({
        roomId: this.props.roomId,
        link: "http://localhost:8080/rest/api/2/issue/POK-3",
        point: 14,
        auth: {
          username: "hlcfan",
          password: "123456"
        }
      });
    }
  }

  componentDidMount() {
    this.loadStoryListFromServer()
    EventEmitter.subscribe("refreshStories", this.loadStoryListFromServer)

    this.props.addSteps({
      title: 'Stories',
      text: 'All your stories are listed here.',
      selector: '#stories',
      position: 'top-right',
      style: defaultTourColor
    })

    this.props.addSteps({
      title: 'Current story',
      text: "The ► indicates the current story.",
      selector: '#stories .story__ungroomed:first-child',
      position: 'bottom-left',
      style: defaultTourColor
    })
  }

  render() {
    const defaultArray = []
    return (
      <div className="panel panel-default" id="stories">
        <div className="panel-heading">
          Stories
          <a className={`${css["stories--sync"]} pull-right`} href="javascript:;" onClick={this.sync}>
            <i className="fa fa-upload"></i> Sync
          </a>
        </div>
        <div id="storyListArea" className="panel-body row">
          <ul className="nav nav-tabs" role="tablist">
            <li role="presentation" className="active">
              <a href="#grooming-list" aria-controls="home" role="tab" data-toggle="tab">Pending</a>
            </li>
            <li role="presentation">
              <a href="#groomed-list" aria-controls="profile" role="tab" data-toggle="tab">Finished</a>
            </li>
          </ul>
          <div className="tab-content">
            <div role="tabpanel" className="row storyListBox tab-pane active" id="grooming-list">
              <StoryList roomState={this.props.roomState} roomId={this.props.roomId} role={this.props.role} data={this.state.data.ungroomed || defaultArray} tab="ungroomed" />
            </div>
            <div role="tabpanel" className="tab-pane" id="groomed-list">
              <StoryList roomState={this.props.roomState} roomId={this.props.roomId} role={this.props.role} data={this.state.data.groomed || defaultArray} tab="groomed" />
            </div>
          </div>
        </div>
      </div>
    )
  }
}
