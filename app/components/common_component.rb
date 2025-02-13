# frozen_string_literal: true

# Common component
class CommonComponent < ViewComponent::Base
  include ApplicationHelper
  include Pagy::Frontend

  # Make an html structure for a bulma/awesome icon
  #
  # Example:
  # icon('fas fa-home')
  # `<span class="icon"><i class="fas fa-home"></i></span>`
  #
  # @return [String] bulma / awesome icon structure
  # @param fas [String] Awesome class for icon, example: "fas fa-home"
  # @param [Hash] opts to generate content
  # @option opts [String] :class style other "span.icon" class
  def icon(fas, **opts)
    content_tag :span, tag.i(class: fas), class: [ "icon", opts[:class] ]
  end

  # Make an html structure for a bulma/awesome text-icon
  #
  # Example:
  # icon('fas fa-home', 'text')
  # `<span class="text-icon"><span class="icon"><i class="fas fa-home"></i></span><span>text</span></span>`
  #
  # @return [String] bulma / awesome text-icon structure
  # @param fas [String] awesome class for icon, example: "fas fa-home"
  # @param text [String] text after icon
  # @param [Hash] opts to generate content
  # @option opts [String] :class style other "span.icon-text" class
  # @option opts [String] :icon_class style other "span.icon" class
  def icon_text(fas, text, **opts)
    content_tag(
      :span,
      icon(fas, class: opts[:icon_class]) + content_tag(:span, text),
      class: [ "icon-text", opts[:class] ]
    )
  end

  # make html structure for pagination with pagy
  def pagy(data)
    tag.div pagy_bulma_nav(data).html_safe, data: { controller: "pagy-initializer" }
  end

  # Shortkut, Make a turbo frame with id yield
  def turbo_yield(body, **opts)
    options = { id: "yield" }.merge(**opts)
    tag.turbo_frame body, **options
  end

  def level_item(head, body, id = nil)
    tag.div tag.div(tag.p(head, class: "heading") + tag.p(body, class: "title is-6")), class: "level-item", id: id
  end

  def level(ary)
    tag.div(safe_join(ary.map { |e| level_item(*e) }), class: "level infobox")
  end
end
