# frozen_string_literal: true

class Editor::Happenings::DetailComponent < CommonComponent
  def initialize(happening:)
    @happening = happening
  end
end
