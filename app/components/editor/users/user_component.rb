# frozen_string_literal: true

class Editor::Users::UserComponent < CommonComponent
  def initialize(user:)
    super
    @user = user
  end

  def confirmed_tag
    if @user.confirmed_at?
      tag.div icon_text("fas fa-user", t(".confirmed")),   class: "tag is-success"
    else
      tag.div icon_text("fas fa-user", t(".unconfirmed")), class: "tag is-warning"
    end
  end
end
