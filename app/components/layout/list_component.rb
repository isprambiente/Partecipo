# frozen_string_literal: true

class Layout::ListComponent < CommonComponent
  def initialize(component:, elements:, id:, pages: nil, **opts)
    @component = component
    @elements = elements
    @id = id
    @pages = pages
    @opts = opts
  end
end
