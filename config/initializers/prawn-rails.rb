PrawnRails.config do |config|
  # Prawn::Document options
  config.page_layout = :portrait
  config.page_size   = "A4"

  # PrawnRails options
  #config.additional_fonts = {
  #  "some-custom-font" => {
  #     normal: Rails.root.join('app/assets/fonts/print/some-custom-font.ttf'),
  #     italic: Rails.root.join('app/assets/fonts/print/some-custom-font-italic.ttf'),
  #     bold: Rails.root.join('app/assets/fonts/print/some-custom-font-bold.ttf'),
  #     bold_italic: Rails.root.join('app/assets/fonts/print/some-custom-font-bold-italic.ttf'),
  #   },
  #}
  #config.default_font_name = "some-custom-font"
end
