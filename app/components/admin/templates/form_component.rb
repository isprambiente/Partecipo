# frozen_string_literal: true

class Admin::Templates::FormComponent < CommonComponent
  def initialize(template:)
    super
    @template = template
  end
end
