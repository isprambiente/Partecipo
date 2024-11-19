# frozen_string_literal: true

class Editor::Questions::SubFormComponent < ViewComponent::Base
  def initialize(form:)
    super
    @form = form
  end
end
