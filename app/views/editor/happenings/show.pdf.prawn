primary = "5f1b2f"
dark = '2d323c'
prawn_document do |pdf|
  render "header", :pdf => pdf
  render @happening, pdf: pdf
end
