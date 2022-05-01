module StoryHelper

  def symbol_point_hash point
    {
      "coffee" => "☕",
      "?"      => "⁉️",
      "null"   => "Pulada"
    }[point] || point
  end

end