# frozen_string_literal: true

class Layout::ModalErrorComponent < ViewComponent::Base
  def initialize(obj: nil, body: nil)
    super
    @obj = obj
    @body = body
  end
end
