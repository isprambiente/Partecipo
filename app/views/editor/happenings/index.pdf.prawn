primary = "5f1b2f"
dark = '2d323c'
prawn_document do |pdf|
  render "header", :pdf => pdf

  if @happenings.present?
    render @happenings, pdf: pdf
  else
    pdf.text "Nessuna data presente", size: 10, color: 'ff0000'
  end
end
