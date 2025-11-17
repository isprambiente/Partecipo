# frozen_string_literal: true

# This helper contain the methods shared for all views
#
# * include Pagy::Frontend
module ApplicationHelper
  # make a div for the font-awesome icons
  def fas_icon(fa_style, span_style: nil, style: false, text: "", tooltip: false)
    # "<span class='icon #{span_style}' #{"style='#{style}'" if style.present?} data-tooltip=\"#{tooltip if tooltip.present?}\" ><i class='fas fa-#{fa_style}' aria-hidden='true'></i></span> #{"<span>#{text}</span>" if text.present?}".html_safe
    tag_i = content_tag(:i, "", class: "fas fa-#{fa_style}", aria: { hidden: "true" })
    span = content_tag(:span, tag_i, class: "icon #{span_style}", style:, data: { tooltip: })
    return span if text.blank?

    span + content_tag(:span, text)
  end

  # Make an html structure for a bulma/awesome icon
  #
  # Example:
  # icon('fas fa-home')
  # `<span class="icon"><i class="fas fa-home"></i></span>`
  #
  # @return [String] bulma / awesome icon structure
  # @param fas [String] class for icon, example: "fas fa-home"
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
  # @param [String] fas class for icon, example: "fas fa-home"
  # @param [String] text for the icon
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

  # map of flash and rub notify() for each flash
  def notifications
    flash.to_h.extract!("success", "notice", "warning", "alert").map { |type, text| notify(text, type:) }.join
  end

  # map of status and run notify() for each status
  # @param [Hash] status
  def notify_status(status = {})
    status.map { |k, v| notify(v, type: k) }.join.html_safe if status.present?
  end

  # @param text [String] text of notification
  # @param type [String] type of notification, default: 'alert'
  # @param timeout [String] set the timeout for javascript action, default: 3000
  # @param hidden [Boolean] set visibility class, default true
  # @return [String] Make a div with for the notification
  def notify(text, type: "alert", timeout: 3000, hidden: true)
    content_tag(:div, text.to_s, class: "notification is-#{type} #{'is-hidden' if hidden}",
                                 data: { controller: "noty", noty_type: type, noty_timeout: timeout })
  end

  # generate a list for a select from an enum
  # @param list [Hash], enum option list, default {}
  # @param scope [String] scope of localization, default ''
  # @return [List]
  def t_enum(list = {}, scope = "")
    list.map { |k, _| [ t(k, scope:), k ] }
  end

  # Localize a DateTime with format :long if #obj is present
  # @param [DateTime] obj
  # @return [String] localized and formatted date
  def l_long(obj = nil)
    l(obj, format: :long) if obj.present?
  end

  # Localize a DateTime with format :time if #obj is present
  # @param [DateTime] obj
  # @return [String] localized and formatted date
  def l_time(obj = nil)
    l(obj, format: :time) if obj.present?
  end

  # Localize a DateTime with format :date if #obj is present
  # @param [DateTime,Date] obj
  # @return [String] localized and formatted date
  def l_date(obj = nil)
    l(obj, format: :date) if obj.present?
  end
end
