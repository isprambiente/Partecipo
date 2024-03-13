# frozen_string_literal: true

class Admin::Templates::TemplateComponent < CommonComponent
  def initialize(template:)
    super
    @template = template
  end
end
