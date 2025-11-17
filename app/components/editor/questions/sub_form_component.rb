# frozen_string_literal: true

class Editor::Questions::SubFormComponent < ViewComponent::Base
  def initialize(form:)
    @form = form
  end
end
