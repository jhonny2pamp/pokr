class UserStoryPoint < ApplicationRecord

  include UidGeneration
  include ActionView::Helpers

  belongs_to :user
  belongs_to :story

  after_save :broadcast_save

  def self.vote user_id, story_id, points, comment=nil
    story = Story.find_by(uid: story_id)
    user_point = UserStoryPoint.find_or_initialize_by user_id: user_id, story_id: story.id
    user_point.comment = comment if comment.present?

    if user_point.update points: points
      user_point
    end
  end

  def broadcast_save
    avatar = image_tag(self.user.avatar.url, class: "profile-image img-circle").html_safe
    ActionCable.server.broadcast "rooms/#{self.story.room.slug}", { vote: JSON.parse(self.to_json), user: { name: self.user.name, avatar: avatar } }
  end

end
