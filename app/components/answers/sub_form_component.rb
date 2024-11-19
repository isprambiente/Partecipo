# frozen_string_literal: true

class Answers::SubFormComponent < ViewComponent::Base
  def initialize(form:)
    super
    @form = form
  end
end
