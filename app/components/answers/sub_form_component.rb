# frozen_string_literal: true

class Answers::SubFormComponent < ViewComponent::Base
  def initialize(form:)
    @form = form
  end
end
