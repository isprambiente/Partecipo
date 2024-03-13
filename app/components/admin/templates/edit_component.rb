# frozen_string_literal: true

class Admin::Templates::EditComponent < CommonComponent
  def initialize(template:)
    super
    @template = template
  end
end
