# frozen_string_literal: true

class Admin::Templates::TemplateComponent < CommonComponent
  def initialize(template:)
    @template = template
  end
end
