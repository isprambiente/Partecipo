# frozen_string_literal: true

class Layout::FormErrorComponent < CommonComponent
  def initialize(form:)
    super
    @form = form
  end
end
