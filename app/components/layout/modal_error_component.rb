# frozen_string_literal: true

class Layout::ModalErrorComponent < ViewComponent::Base
  def initialize(obj: nil, body: nil)
    @obj = obj
    @body = body
  end
end
