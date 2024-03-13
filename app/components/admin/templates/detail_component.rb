# frozen_string_literal: true

class Admin::Templates::DetailComponent < CommonComponent
  def initialize(template:)
    super
    @template = template
  end
end
