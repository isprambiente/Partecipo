# frozen_string_literal: true

class Groups::GroupComponent < CommonComponent
  def initialize(group:)
    @group = group
  end

  def member_tag
    tag.div icon_text("fas fa-user-cog", "#{@group.users.count} members"), class: "tag"
  end
end
