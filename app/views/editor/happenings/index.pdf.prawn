primary = "5f1b2f"
dark = '2d323c'
prawn_document do |pdf|
  render "header", :pdf => pdf

  if @happenings.present?
    @happenings.each do |happening|
      render happening, pdf: pdf
      if happening.tickets.present?
        render happening.tickets, pdf: pdf
      else
        pdf.text "Nessuna prenotazione registrata", size: 10, color: 'ff0000'
      end
      pdf.move_down 10
    end
  else
    pdf.text "Nessuna data presente", size: 10, color: 'ff0000'
  end
end
